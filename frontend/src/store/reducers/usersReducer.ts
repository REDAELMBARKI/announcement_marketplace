const initState = {} ;


const usersReducer = (state = initState  ,  action) => {
    switch(action.type) {
              case "adduser" : 
                    return {}
              default : 
                    return state 
    }
}
export default usersReducer ;