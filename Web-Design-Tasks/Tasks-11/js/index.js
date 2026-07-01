var userName = "Sama"
var lastName = "mohamed"
var fullName = userName + " " + lastName
console.log(fullName)

// ++ increment
var t = 30
console.log(t++) // 30
console.log(t) // 31
console.log(++t) // 32

// // -- Decrement
console.log(t--) // 32
console.log(t) // 31
console.log(--t) // 30

console.log(name == num) // value
console.log(name === num) // value , type

console.log(name != num) // value false
console.log(name !== num) // value , type true

// typeof

console.log(typeof(boonlean)) // true , false
console.log(typeof string ) // string

console.log(typeof Object);

var courses=[ "html","css", "js" ,"bootstrap"]
var newCourse= prompt("enter a cours")
if(courses.includes(newCourse)){
    console.log(newCourse)
}
else {
    courses.push(newCourse)
    console.log(courses)
}