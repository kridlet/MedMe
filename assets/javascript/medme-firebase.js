// Initialize Firebase
var config = {
    apiKey: "AIzaSyC9MDdcy45WokbyKUmzPf93RpeAcKaWcWo",
    authDomain: "medme-f87ee.firebaseapp.com",
    databaseURL: "https://medme-f87ee.firebaseio.com",
    projectId: "medme-f87ee",
    storageBucket: "medme-f87ee.appspot.com",
    messagingSenderId: "658068228468"
};
firebase.initializeApp(config);

var database = firebase.database();
var auth = firebase.auth();

function checkLoginStatus(createAnon = false) {
    var user = auth.currentUser;
    if (user) {
        // User is signed in.
    } else {
        // No user is signed in.
        if (createAnon === "create") {
            createAnonUser("tempDrug")
        }
    }
}

// watch for login/logout events
auth.onAuthStateChanged(function (user) {
    console.log(user);
    if (user) {
        // do things when logged in, like show the logout button and hide the login button
        $("#login-with-credentials").hide();
        $("#logout-user").show();
    } else {

        // do things when logged out, like show the login button and hide the logout button
        $("#logout-user").hide();
        $("#login-with-credentials").show();
    }
});

// auto complete states
// $(function () {
//     var availableStates = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"];
//     $("#state").autocomplete({
//         source: availableStates
//     });
// });


function createAnonUser(initialDrug) {
    // sign in an anonymous user
    auth.signInAnonymously()
        // then add a dummy record to that user (with the initial drug)
        .then(function (result) {
            database.ref('users/' + auth.currentUser.uid).set({
                firstName: "",
                lastName: "",
                address: "",
                city: "",
                state: "",
                zip: "",
                email: "",
                phone: "",
                lat: "",
                lng: "",
                initialDrug: initialDrug,
                timeZone: "",
                termsAccepted: "",
            });
        });
}

function addDrug(drugName, drugDosage, drugFrequency, RxCUI) {
    // add a new drug to the user
    database.ref('users/' + auth.currentUser.uid + '/rx').push().set({
        name: drugName,
        dosage: drugDosage,
        frequency: drugFrequency,
        RxCUI: RxCUI,
    });
}

function convertAnonToCredentialedUser(email, password, firstName, lastName, address, city, state, zip, phone, termsAccepted) {
    // create the email and password credential, to upgrade the anonymous user
    var credential = firebase.auth.EmailAuthProvider.credential(email, password);
    // link the credential to the currently signed in (anonymous) user
    auth.currentUser.linkWithCredential(credential)
        // then update the users profile record with the information they filled out
        .then(function (user) {
            database.ref('users/').child(user.uid).update({
                firstName: firstName,
                lastName: lastName,
                address: address,
                city: city,
                state: state,
                zip: zip,
                email: email,
                phone: phone,
                termsAccepted: Date.now(),
            });
            $(".alert-area").html("<div class='alert alert-success fade in'>New user account successfully added.</div>");
        }, function (error) {
            $(".alert-area").html("<div class='alert alert-danger fade in'>" + error.message + "</div>");
            console.log("Error upgrading anonymous account", error);
        });
}

// watch for teaser drug request
$("#btn-submit-initial-drug").click(function () {
    // get the teaser drug from the user input
    var initialDrug = $("#initial-drug-name").val();
    // call function to create anonymous user with teaser drug
    createAnonUser(initialDrug);
});

// watch for add drug request
// $("#btn-add-drug").click(function () {
//     // get drug details from user input
//     var drugName = $("#drug-name").val();
//     var drugDosage = $("#drug-dosage").val();
//     var drugFrequency = $("#drug-frequency").val();
//     var RxCUI = $("#RxCUI").val();
//     // add the drug to the user's profile
//     addDrug(drugName, drugDosage, drugFrequency, RxCUI);
// });

//watch for profile update, at which time we transfer anonymous account to a credentialed account
$(document).on('submit', '#registration', function (event) {
    console.log("button");
    event.preventDefault();
    // get user details from user input
    var email = $("#email").val();
    var password = $("#password").val();
    var firstName = $("#first-name").val();
    var lastName = $("#last-name").val();
    var address = $("#address").val();
    var city = $("#city").val();
    var state = $("#state").val();
    var zip = $("#zip").val();
    var phone = $("#phone").val();
    var termsAccepted = $("#terms-accepted").val();
    // convert the anonymous account to a credentialed account and fill user profile with input data
    console.log(email, password, firstName, lastName, address, city, state, zip, phone, termsAccepted);
    convertAnonToCredentialedUser(email, password, firstName, lastName, address, city, state, zip, phone, termsAccepted);
});


// watch for logout
$("#btn-logout").click(function () {
    // logout
    auth.signOut();
});

// watch for sign in of existing credentialed user (for return to their profile)
$("#btn-login-with-credentials").click(function () {
    // get credentials from user input
    var email = $("#login-email").val();
    var password = $("#login-password").val();
    // lof the user in
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    });
});

$("#btn-list-user-drugs").click(function () {
    // Loop through users in order with the forEach() method. The callback
    // provided to forEach() will be called synchronously with a DataSnapshot
    // for each child:
    var query = database.ref('users/' + auth.currentUser.uid + '/rx').orderByKey();
    query.once("value")
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                // childData is the actual contents of the child
                var childData = childSnapshot.val();
                console.log(childData.name);
                console.log(childData.dosage);
                console.log(childData.frequency);
                console.log(childData.RxCUI);
            });
        });
});

$("#btn-list-drug-interaction").click(function () {
    // Loop through users in order with the forEach() method. The callback
    // provided to forEach() will be called synchronously with a DataSnapshot
    // for each child:
    var query = database.ref('users/' + auth.currentUser.uid + '/rx').orderByKey();
    query.once("value")
        .then(function (snapshot) {
            // initialize a blank drug array
            var drugRxCUIs = '';
            snapshot.forEach(function (childSnapshot) {
                // childData is the actual contents of the child
                var childData = childSnapshot.val();
                // add the drug ID to drug array
                drugRxCUIs += childData.RxCUI + '+';
            });
            // go get the interactions from NIH 
            $.ajax({
                url: 'https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=' + drugRxCUIs,
                success: function (data) {
                    console.info(data);
                    // loop through interaction type groups - this is specific to the data format of the NIH API response
                    for (i = 0; i < data.fullInteractionTypeGroup.length; i++) {
                        // loop through interaction types - this is specific to the data format of the NIH API response
                        for (j = 0; j < data.fullInteractionTypeGroup[i].fullInteractionType.length; j++) {
                            console.log(data.fullInteractionTypeGroup[i].fullInteractionType[j].interactionPair[0].description);
                            console.log(data.fullInteractionTypeGroup[i].fullInteractionType[j].interactionPair[0].severity);
                        }
                    }
                }
            });
        });
});