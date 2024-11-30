
import React from 'react';
 import { GestureHandlerRootView } from 'react-native-gesture-handler';
 
import DragNDrop from "./component/DragNDrop";

import Drag from "./component/Drag";



function App() {
  return (
    
    <>
    
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'seashell' }}>
    
<DragNDrop/>
          </GestureHandlerRootView> 
 
  {/* <Drag/> */}
</>


  );

}

export default App;
