$(document).ready(function() {
$('.toggle-password').on('click', function() {
const button = $(this);
const passwordField = $('#senha');
const icon = button.find('i');

if (passwordField.attr('type') === 'password') {
passwordField.attr('type', 'text');
icon.removeClass('fas fa-eye').addClass('fas fa-eye-slash');
button.attr('title', 'Ocultar senha');
} else {
passwordField.attr('type', 'password');
icon.removeClass('fas fa-eye-slash').addClass('fas fa-eye');
button.attr('title', 'Mostrar senha');
}
});
});

if ($(".btn-facebook").length > 0) {
window.fbAsyncInit = function() {
FB.init({
appId            : '',
autoLogAppEvents : true,
xfbml            : true,
version          : 'v10.0'
});
};
(function(d, s, id) {
var js, fjs = d.getElementsByTagName(s)[0];
if (d.getElementById(id)) {
return;
}
js = d.createElement(s);
js.id = id;
js.src = "//connect.facebook.net/pt_BR/sdk.js";
fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
};

function fbLoginUser() {
FB.getLoginStatus(function(response) {
statusChangeCallback(response);
});
};

function checkLoginState() {
FB.getLoginStatus(function(response) {
statusChangeCallback(response);
});
};

function statusChangeCallback(response) {
if (response.status === 'connected') {
if (response.authResponse) {
LoginAction.loginFacebook(response.authResponse.accessToken, response.authResponse.userID, retornoLoginFacebook);
} else {
alert('Não foi possível realizar o login');
}
} else if (response.status === 'not_authorized') {
alert('Por favor faça o login e autorize a nossa Applicação');
}
};

function fbLogoutUser() {
FB.getLoginStatus(function(response) {
if (response && response.status === 'connected') {
FB.logout(function(response) {
});
}
});
};

function fbLogin(){
FB.login(function(response) {
if (response.authResponse) {
$.getJSON("/portal/loginFacebook", {format: "json", accessToken: response.authResponse.accessToken, userID: response.authResponse.userID}).done(function(data) {
if (data.retorno == -1) {
alert(data.mensagem);
return;
}
if (data.retorno >= 0) {
location.href= data.url;
}
});
} else {
alert('Não foi possível realizar o login');
}
}, {
scope: 'public_profile,email'
});
};

function onSignIn(googleUser) {
var profile = googleUser.getBasicProfile();
};

if ($(".btn-google").length > 0) {
gapi.load('auth2', function() {
auth = gapi.auth2.init({
client_id: "",
scope: "profile email"
})
auth.attachClickHandler('signinButton', null, onSignIn, onSignInFailure);
});
};

function onSignIn(googleUser) {
var googleClientID = '';
$.getJSON("/portal/loginGoogle", {format: "json", idTokenString: googleUser.getAuthResponse().id_token, googleClientID: googleClientID}).done(function(data) {
if (data.retorno == -1) {
alert(data.mensagem);
return;
}
if (data.retorno >= 0) {
location.href= data.url;
}
});
};
function retornoLoginGoogle(loginDWR) {
};
function onSignInFailure() {
alert('Falha ao tentar realizar o login. Tente novamente ou tenta com sua senha colocada no nosso cadastro.')
};
function onSubmit(token) {
document.getElementById("formLogin").submit();
}
