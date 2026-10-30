function update_detailed_data() {
    let loader_= document.getElementById('mainloader2')

    if(!loader_){
        alert('loader id was not found')
    }
   


  if (!(localStorage.getItem('continueoff')=='allow') ) {
    if (!(localStorage.getItem('continueoff')=='allow') ) {


      // location.reload(false)
      let count_ = 0
      let state__int44 = setInterval(() => {

        count_ = count_ + 1
        let do_;
        let st = accessInfo('late2')
        if (count_ == 1) {
          do_ = true
          storeInfo('late2', null)
          // console.log('Requesting')

        }

        if (st == 'done') {
          if (count_ == 1) {
            do_ = true
            storeInfo('late2', null)


          } else {
            do_ = false
            


            clearInterval(state__int44)
          
          }

        } else {
          if (st == 'failed') {
            do_ = true
            storeInfo('late2', null)
            count_ = 0
            // console.log('Retrying..')


          } else {
            if (st == 'busy') {
              // console.log('Busy..')
              do_ = false
            } else {
              do_ = true
            }
          }
        }
        if (!(localStorage.getItem('continueoff')=='allow')) {

          if (do_) {
            if (steps_to_remove_loader == 1) {
              if(!(localStorage.getItem('continueoff')=='allow')){
                if (!(localStorage.getItem('continueoff')=='allow') ){
                       getproducts_2_3()
                }else{
                 if (extact3_no==0){
            extract3()
            extact3_no=1
      }
                  
                  clearInterval(state__int44)
               

                }
              }
            } else {
              console.log('validation has not taken place..')
            }
          }



        }else{
          if (extact3_no==0){
            extract3()
            extact3_no=1
      }
    
          clearInterval(state__int44)
     

        }


      }, 12000)






    }else{
      
    }
  }else{
    
  }
}
