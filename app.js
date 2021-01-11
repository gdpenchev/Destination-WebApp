const Auth = firebase.auth();
const DB = firebase.firestore();

const app = Sammy('#container', function(){


    this.use('Handlebars', 'hbs');

    this.get('/home', function(context){
        DB.collection('destinations')
        .get()
        .then(response =>{
            context.destinations = response.docs.map(destination => {return {id: destination.id, ...destination.data()}})
            loadingOfPartials(context)
         .then(function(){
             this.partial('./templates/home.hbs');
             
         })
        }).catch(console.log(e))
         
    })
    this.get('/register', function(context){
        loadingOfPartials(context)
        .then(function(){
            this.partial('./templates/register.hbs');
        }).catch(console.log(e))
    })
    this.post('/register',function(context){
        const { email, password, rePassword} = context.params;

        if(password !== rePassword){
            
            return;
        }
        Auth.createUserWithEmailAndPassword(email, password)
        .then(userData =>{
            this.redirect('/home');
            document.getElementById('register').style.display = "block"
            setTimeout(showMessage,3000);
        }).catch(console.log(e));
    })
    this.get('/loginPage', function(context){
        loadingOfPartials(context)
        
        .then(function(){
            this.partial('./templates/login.hbs');
            console.log(context);
        }).catch(console.log(e))
    })
    this.post('/login',function(context){
        const {email, password} = context.params;
        Auth.signInWithEmailAndPassword(email, password)
        .then(userData =>{
            setUserData(userData);
            this.redirect('/home')
        })
    })
    this.get('/create', function(context){
        loadingOfPartials(context)
        .then(function(){
            this.partial('./templates/create.hbs');
        }).catch(console.log(e))
    });
    this.post('/create-destination', function(context){
          const {destination, city, duration, departureDate, imgUrl} = context.params;
          if(destination === null && city === null && duration === null && departureDate === null && imgUrl === null){
              return;
          }
          DB.collection('destinations').add({
              destination,
              city,
              duration,
              departureDate,
              imgUrl,
              destinationPerson : getUserData().uid
              
          }).then(createdInfo => {
              this.redirect('/home')
          })
    })

    this.get('/destination', function(context){
        DB.collection('destinations')
        .get()
        .then(response =>{
            context.destinations = response.docs.map(destination => {return {id: destination.id, ...destination.data()}})
            loadingOfPartials(context)
         .then(function(){
             this.partial('./templates/detailsDashboard.hbs');
             console.log(context);
         })
        }).catch(console.log(e))
    })
    this.get('/delete/:destinationId',function(context){
        console.log(context);
        const {destinationId} = context.params;
        DB.collection('destinations')
        .doc(destinationId)
        .delete()
        .then(()=>{
            this.redirect('/destinations');
        }).catch(console.log(e))
        
    })
    this.get('/details/:destinationId', function(context){
        const {destinationId} = context.params;
        DB.collection('destinations')
        .doc(destinationId)
        .get()
        .then(response =>{
            context.destination = {id: destinationId, ...response.data()}
            loadingOfPartials(context)
        .then(function(){
            console.log(context);
            this.partial('../templates/details.hbs');
        })
        }).catch(console.log(e))
        
    })
    this.get('/edit/:destinationId', function(context){
        const {destinationId} = context.params;
        DB.collection('destinations')
        .doc(destinationId)
        .get()
        .then(response =>{
            context.destination = {id: destinationId, ...response.data()}
            loadingOfPartials(context)
            .then(function(){
                this.partial('../templates/edit.hbs');
                console.log(context);
            })
        }).catch(console.log(e))
    })
    this.post('/edit/:destinationId', function(context){
        const {destinationId, destination, city, duration, departureDate, imgUrl} = context.params;
        DB.collection('destinations')
        .doc(destinationId)
        .get()
        .then(response =>{
            return DB.collection('destinations')
            .doc(destinationId)
            .set({
                ...response.data(),
                destination,
                city,
                duration,
                departureDate,
                imgUrl
            })
        })
        .then((response)=>{
            this.redirect(`/details/${destinationId}`)
        })
        .catch(console.log(e))
    })


    this.get('/logout', function(context){
        Auth.signOut()
        
        .then(useData =>{
            
            
            clearUserData();
           this.redirect('/loginPage');
           
           console.log(context);
        });
    }).catch(console.log(e))
    

});

(()=>{
    app.run('/home');
})();

function loadingOfPartials(context){

    const currUser = getUserData();
    context.loggedIn = Boolean(currUser);
    context.currEmail = currUser ? currUser.email : '';

    return context.loadPartials({
        'header': './templates/header.hbs',
        'footer': './templates/footer.hbs'
    });
};
function setUserData(userData){
   const{ user: {email, uid}} = userData;
   localStorage.setItem('user', JSON.stringify({email,uid}));
}
function clearUserData(){
    localStorage.clear();
}
function getUserData(){
    const currUser = localStorage.getItem('user');

    if(currUser){
        return JSON.parse(currUser);
    }
    else{
        return null;
    }

    
}
function showMessage(){
    document.getElementById('register').style.display = ""
}