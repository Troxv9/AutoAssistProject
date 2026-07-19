import { NextResponse } from "next/server"
import { calculateImport } from "@/lib/customs"
import { getCalculationContext } from "@/lib/calculation-context"
import { copartFees } from "@/lib/providers"
import type { Powertrain, Steering, Vehicle } from "@/lib/vehicles"

export async function POST(request:Request){
  try{const b=await request.json();const n=(v:unknown)=>Math.max(0,Number(v)||0);const purchaseUsd=Number(b.purchaseUsd),year=Number(b.year),engineCc=Number(b.engineCc)
    if(isNaN(purchaseUsd)||purchaseUsd<=0||isNaN(year)||year<=0||(b.powertrain==='electric'?(isNaN(engineCc)||engineCc<0):(isNaN(engineCc)||engineCc<=0)))return NextResponse.json({error:"შეავსეთ ყველა სავალდებულო ველი"},{status:400})
    const c=await getCalculationContext();const vehicle:Vehicle={provider:"copart",externalId:"manual",title:"Manual",year,make:"",model:"",engineCc,powertrain:b.powertrain as Powertrain,steering:b.steering as Steering,price:purchaseUsd,currency:"USD",location:"",sourceUrl:"",fetchedAt:new Date().toISOString()}
    const feesUsd=b.feesMode==="manual"?n(b.feesUsd):copartFees(purchaseUsd).total
    const r=calculateImport(vehicle,{purchaseUsd,feesUsd,inlandUsd:n(b.inlandUsd),oceanUsd:n(b.oceanUsd),insuranceUsd:n(b.insuranceUsd),portUsd:n(b.portUsd),repairsUsd:n(b.repairsUsd),exchangeRate:c.exchangeRate},c.rules)
    return NextResponse.json({...r,exchangeRate:c.exchangeRate,exchangeSource:c.exchangeSource,ruleVersion:c.ruleVersion})
  }catch{return NextResponse.json({error:"გამოთვლა ვერ შესრულდა"},{status:500})}
}
