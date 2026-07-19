import { NextResponse } from "next/server"
import { calculateImport } from "@/lib/customs"
import { getCalculationContext } from "@/lib/calculation-context"
import type { Powertrain, Steering, Vehicle } from "@/lib/vehicles"

export async function POST(request:Request){
  try{const b=await request.json();const purchaseUsd=Number(b.purchaseUsd),year=Number(b.year),engineCc=Number(b.engineCc)
    if(isNaN(purchaseUsd)||purchaseUsd<=0||isNaN(year)||year<=0||(b.powertrain==='electric'?(isNaN(engineCc)||engineCc<0):(isNaN(engineCc)||engineCc<=0)))return NextResponse.json({error:"შეავსეთ ყველა სავალდებულო ველი"},{status:400})
    const c=await getCalculationContext();const vehicle:Vehicle={provider:"copart",externalId:"manual",title:"Manual",year,make:"",model:"",engineCc,powertrain:b.powertrain as Powertrain,steering:b.steering as Steering,price:purchaseUsd,currency:"USD",location:"",sourceUrl:"",fetchedAt:new Date().toISOString()}
    const r=calculateImport(vehicle,{purchaseUsd,feesUsd:0,inlandUsd:0,oceanUsd:0,insuranceUsd:0,portUsd:0,repairsUsd:0,exchangeRate:c.exchangeRate},c.rules)
    return NextResponse.json({...r,exchangeRate:c.exchangeRate,exchangeSource:c.exchangeSource,ruleVersion:c.ruleVersion})
  }catch{return NextResponse.json({error:"გამოთვლა ვერ შესრულდა"},{status:500})}
}
