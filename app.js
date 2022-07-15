const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const fetch = require('node-fetch');
mongoose.connect("mongodb+srv://admin-ujjwal:test123@cluster0.jbpqb.mongodb.net/libraryDB",{useNewUrlParser: true});

const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

let expression="",message="",no=0,message_borrow="",message_add="",book_name_check="",author_name_check="";
let book_name_return="",author_name_return,member_id_return="",date_return="",fine=0,borrow_date_return="";
let copy_check=0,total_check=0,borrower_name_check=[],borrower_id_check=[],borrower_date_check=[],count=[];

var today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); 
let yyyy = today.getFullYear();
today = mm + '/' + dd + '/' + yyyy;

//............................SCHEMAS...................................................

const borrowSchema = new mongoose.Schema({
    member_name:{   
        type: String,
        required: [true,"Please fill the field!"]
    },
    member_id:{
        type: String,
        required: [true,"Please fill the field!"]
    },
    date:{
        type: String,
        required: [true,"Please fill the field!"]
    }
});

const checkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Please fill the field!"]
    },
    author: {
        type: String,
        required: [true,"Please fill the field!"]
    },
    current:{
        type: Number
    },
    borrows: Number,
    personDetails: [borrowSchema]
});

//............................SCHEMAS....................................................



//....................INITIALIZING THE DATABASE USING GOOGLE BOOKS API...................
const Book = mongoose.model("Book",checkSchema);
const Person = mongoose.model("Person",borrowSchema);

// let url="https://www.googleapis.com/books/v1/volumes?q=''"
// let url="https://www.googleapis.com/books/v1/volumes?q=flowers"
// let url="https://www.googleapis.com/books/v1/volumes?q=John"
// let url="https://www.googleapis.com/books/v1/volumes?q=of"
// let url="https://www.googleapis.com/books/v1/volumes?q=many"
// let url="https://www.googleapis.com/books/v1/volumes?q=the"
// let url="https://www.googleapis.com/books/v1/volumes?q=life"
// let url="https://www.googleapis.com/books/v1/volumes?q=destiny"
// let url="https://www.googleapis.com/books/v1/volumes?q=forever"
// let url="https://www.googleapis.com/books/v1/volumes?q=sad"
// let url="https://www.googleapis.com/books/v1/volumes?q=sorrow"
// let url="https://www.googleapis.com/books/v1/volumes?q=philosophy"
// let url="https://www.googleapis.com/books/v1/volumes?q=science"
// let url="https://www.googleapis.com/books/v1/volumes?q=happy"
// let url="https://www.googleapis.com/books/v1/volumes?q=good"
// let url="https://www.googleapis.com/books/v1/volumes?q=start"
// let url="https://www.googleapis.com/books/v1/volumes?q=finish"
// let url="https://www.googleapis.com/books/v1/volumes?q=known"
// let url="https://www.googleapis.com/books/v1/volumes?q=stop"
// let url="https://www.googleapis.com/books/v1/volumes?q=moon"
// let url="https://www.googleapis.com/books/v1/volumes?q=jump"
// let url="https://www.googleapis.com/books/v1/volumes?q=zero"

// fetch(url).then(function(response){
//     response.json().then(function(res){
//         let len=res.items.length;
//         for(let i=0;i<len;i++){
//             if(res.items[i].volumeInfo.hasOwnProperty('authors')){}
//             else continue;
//             let book=res.items[i].volumeInfo.title;
//             let authors="";
//             for(let j=0;j<res.items[i].volumeInfo.authors.length;j++){
//                 authors+=res.items[i].volumeInfo.authors[j];
//                 if(j==(res.items[i].volumeInfo.authors.length-1)) break;
//                 authors+=", ";
//             }
//             let books=new Book({
//                 name: book,
//                 author: authors,
//                 current:Math.floor(Math.random()*11)+20,
//                 borrows:0,
//                 personDetails:[]
//             })
//             books.save();
//         }
//     })
// })

            // let books=new Book({
            //     name: "R.D. Sharma",
            //     author: "R.D. Sharma",
            //     current:4,
            //     borrows:0,
            //     personDetails:[]
            // })
            // books.save();


//....................INITIALIZING THE DATABASE USING GOOGLE BOOKS API...................


                             
//..................................HOME.................................................


app.get("/",function(req,res){
    let len1;
    Book.find(function(err,books){
        let borrow_array=new Map();
        let status=new Map();
        let arr2=new Set();
        let arr3=[],arr4=[],arr5=[],arr6=[];
        if(err){
            console.log(err);
        }
        else{
            let len=books.length;
            len1=len;
            for(let i=0;i<len;i++){
                arr2.add(books[i].name);
                arr6.push(i+1);
                if(borrow_array.has(books[i].name)){
                    if(books[i].borrows>borrow_array.get(books[i].name)){
                        borrow_array.set(books[i].name,books[i].borrows);
                        if(status.get(books[i].name)==false){
                            if(books[i].current>0){
                                status.set(books[i].name,true);
                            }
                        }
                    }
                }
                else{
                    borrow_array.set(books[i].name,books[i].borrows);
                    if(books[i].current==0) status.set(books[i].name,false);
                    else status.set(books[i].name,true);
                }
            }
            for(let item of arr2){
                arr3.push(item);
            }
            arr3.sort(function(a,b){
                if(borrow_array.get(a)==borrow_array.get(b)) return 0;
                else if(borrow_array.get(a)>borrow_array.get(b)) return -1;
                else return 1;
            });
            //console.log(arr3);
            for(let item of arr3){
                arr4.push(borrow_array.get(item));
                if(status.get(item)==true){
                    arr5.push("Available");
                }
                else{
                    arr5.push("Not Available");
                }
            }
        }
        setTimeout(function(){
            res.render("index",{
                arr:arr6,
                book_home:arr3,
                borrows_home:arr4,
                status_home:arr5      
            });
        },2000);
    })
})



//..................................HOME.................................................


//.................................CHECK.................................................

app.get("/check",function(req,res){
    res.render("check",{
        book:book_name_check,
        author:author_name_check,
        copy:copy_check,
        total:total_check,
        borrower_name:borrower_name_check,
        borrower_id:borrower_id_check,  
        borrower_date:borrower_date_check,
        arr: count
    });
});

app.post("/check",function(req,res){
    no=0;
    copy_check=0;
    total_check=0;
    borrower_name_check=[];
    borrower_id_check=[];
    borrower_date_check=[];
    count=[];
    book_name_check=req.body.book;
    author_name_check=req.body.author;
     Book.find(function(err,books){
        if(err){    
            console.log(err);
        }
        else{
            Book.findOne({name:book_name_check, author:author_name_check},function(err,book){
                if(err){
                    console.log(err);
                }
                else if(!book){
                    
                }
                else{
                    copy_check=book.current;
                    total_check=book.borrows;
                    for(let j=0;j<book.personDetails.length;j++){
                        borrower_name_check.push(book.personDetails[j].member_name);
                        borrower_id_check.push(book.personDetails[j].member_id);
                        borrower_date_check.push(book.personDetails[j].date);
                        count.push(j+1);
                    }
                }
                
            })
        }
    });
    setTimeout(function(){
    res.redirect("/check");
},2000);
});

//.................................CHECK.................................................


//.................................BORROW.................................................

app.get("/borrow",function(req,res){
    res.render("borrow",{

    });
});

app.post("/borrow",function(req,res){
    no=0;
    let book_name=req.body.book_name;
    let author_name=req.body.author_name;
    let member_name=req.body.member_name;
    let member_id=req.body.member_id;
    const person=new Person({
        member_name: member_name,
        member_id: member_id,
        date: today
    });
     
    Book.findOne({name:book_name, author:author_name},function(err,book){
        if(err){
            console.log(err);
        }
        else if(!book || book.current===0){
            res.redirect("/borrow_neg_result");
        }
        else{
            no=book.current;
            person.save();
            let detail=book.personDetails;
            detail.push(person);
            Book.findOneAndUpdate({name:book_name,author:author_name},{
            current:no-1,
            borrows:book.borrows+1,
            personDetails:detail,
            },function(err,books){
             if(err){
            console.log(err);
             }
             else{
            console.log("Successfully updated!");
             }
            });
            message_borrow="Data Added Successfully!";
            res.redirect("/add_pos_result");
        }
    });
});


app.get("/borrow_neg_result",function(req,res){
    res.render("borrow_neg_result",{

    })
});

//.................................BORROW.................................................


//.................................RETURN.................................................

app.get("/return",function(req,res){
    res.render("return",{

    });
});

app.post("/return",function(req,res){
    book_name_return=req.body.book;
    author_name_return=req.body.author;
    member_id_return=req.body.member_id;
    date_return=today;
    let ok=false;
    Book.findOne({name:book_name_return,author:author_name_return},function(err,book){
        if(err){
            console.log(err);
        }
        else if(!book){
            res.redirect("/error_page");
        }
        else if((book.personDetails).filter(item => item.member_id==member_id_return).length>0){
            let arr=book.personDetails;
            // console.log(arr);
            for(let j=0;j<arr.length;j++){
             if(arr[j].member_id==member_id_return){
             ok=true;
             borrow_date_return=arr[j].date;
             let start_date=new Date(borrow_date_return);
             let end_date=new Date(date_return);
             console.log(borrow_date_return,date_return);
             const diffTime = Math.abs(end_date - start_date);
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             fine=(diffDays-15);
             if(fine<0) fine=0;
             break;
                }
              }
             res.redirect("/fine");
        }
        else{
             res.redirect("/error_page");
        }
    })
});


app.get("/fine",function(req,res){
    res.render("fine",{
        amount: fine,
        date: borrow_date_return
    })
});

app.get("/error_page",function(req,res){
    res.render("error_page",{

    });
});

app.post("/fine",function(req,res){
    Book.find(function(err,books){
        if(err){    
            console.log(err);
        }
        else{
            let len=books.length;
            for(let i=0;i<len;i++){
                if(books[i].name==book_name_return && books[i].author==author_name_return){
                    let arr=books[i].personDetails;
                    let no=0;
                    let arr1=[];
                    for(let j=0;j<arr.length;j++){
                        if(arr[j].member_id==member_id_return && no==0){
                            no++;
                            continue;
                        }
                        arr1.push(arr[j]);
                    }
                    Book.findOneAndUpdate({name:book_name_return,author:author_name_return},{
                        current:books[i].current+1,
                        personDetails:arr1,
                    },function(err,books){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log("Successfully updated!");
                        }
                    });
                    break;
                }
            }
        }
    })
    Person.deleteOne({member_id:member_id_return, date:date_return},function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("Data deleted Successfully!");
        }
    });
    setTimeout(function(){
    res.redirect("/return");
    },2000);
});


//.................................RETURN.................................................




//...................................ADD.................................................

app.get("/add",function(req,res){
    res.render("add",{
        
    })
});

app.post("/add",function(req,res){
    let book_name=req.body.book;
    let author_name=req.body.author;
    let copy=req.body.copy;
    Book.findOne({name:book_name, author:author_name},function(err,books){
        if(err){
            console.log(err);
        }
        else if(!books){
            const book=new Book({
                name: book_name,
                author: author_name,
                current: copy,
                borrows: 0,
                personDetails: []
            });
            book.save();
        }
        else{
            let curr=books.current;
            Book.findOneAndUpdate({name:book_name, author:author_name},
                {
                    current: curr+parseInt(copy)
                },
                function(err,books){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("Successfully updated");
                    }
            })
        }
    })
    res.redirect("/add_pos_result");
});

app.get("/add_pos_result",function(req,res){
    res.render("add_pos_result",{

    })
});

//...................................ADD.................................................


const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
   console.log("Server is running on port 3000");
});