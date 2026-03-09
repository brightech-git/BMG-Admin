import schemeAppAxios from "../../api/schemeAxios"


export const getDashBoardDetails =async (params)=>{
    try{
        console.log(params,"params ..")
        const {data} = await schemeAppAxios.get("dashboard/scheme-summary",{
            params:params}
        )        

        return data
    }
    catch(e){
     console.warn("App Dashboard get fails",e)
    }
}