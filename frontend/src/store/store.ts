

import usersReducer from './reducers/usersReducer'


//toolkit way
import usersReducer from './slices/userSlice';

// the old way 
export const store = createstore(combineReducers({
        
       users : usersReducer
}));




// toolkit 
 export const store  = configureStore({
         reducer : {

              users : 
         }
 })

