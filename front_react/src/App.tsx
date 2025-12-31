import './App.css'
import { Route, Routes } from 'react-router-dom';


//라우팅 
function App() {
  
  //UserContainer에 사용자를 구현하고 
  //AdminContainer에 관리자를 구현하겠습니다.
  return ( 
    <Routes>
      <Route element={<UserContainer/>}>
          
      </Route>
      <Route element={<AdminContainer/>}>
      </Route>
    </Routes>
  )
}

export default App
