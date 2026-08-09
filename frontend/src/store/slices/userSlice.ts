


const empSlice = createSlice({
     name : "emps" , 
     initialState : [
       {
         "_id" : "e1",
        "nomEmp" :"Lamrabet",
        "prenomEmp" :"Oussama",
        "poste" : "Directeur",
        "département" :{
        "codeDep" : "1",
        "nomDep": "RH"
        }
       }

], 
     reducers : {
            addemp : (state , action) => {
                return [
                    ...state , 
                    action.payload
                ]
            } , 
            removeemp : (state , action) => {
                return state.filter(e => e._id === action.payload) ;
            } , 
            adddepart :  (state , action) => {
                return  ;
            }
     }

})


export const  {addemp , removeemp} =  empSlice.actions ;

export default empSlice.reducer ;