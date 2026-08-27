

$( "#imagemFile" ).change(function(event) {

    var elementFile = event.srcElement || event.target;
    var files = elementFile.files;
    upload(files);
});

function upload(files) {
    
    var idPhoto = $('#idPhoto').val();
    var idSite = $('#idSite').val();

    var formData = new FormData();
    formData.append("photo", files[0], "foto" + idPhoto + ".jpg");
    formData.append('idSite', idSite);
    formData.append('idPhoto', idPhoto);

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function(e){uploadCompleteImage(e)}, false);
    xhr.open("POST", "/portal/RecebeImagem", true);
    xhr.send(formData);
}


$( "#btnLoadPhoto" ).click(function() {

    var video = document.getElementById('videoPhoto');

    // Get access to the camera!
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false}).then(function(stream) {
            video.srcObject = stream;
            video.play();
        });
    } else if(navigator.getUserMedia) { // Standard
        navigator.getUserMedia({ video: true, audio: false}, function(stream) {
            video.srcObject = stream;
            video.play();
        }, errBack);
    } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
        navigator.webkitGetUserMedia({ video: true, audio: false}, function(stream){
            video.srcObject = stream;
            video.play();
        }, errBack);
    } else if(navigator.mozGetUserMedia) { // Mozilla-prefixed
        navigator.mozGetUserMedia({ video: true, audio: false}, function(stream){
            video.srcObject = stream;
            video.play();
        }, errBack);
    }
    video.className = 'm-2';
    $('#btnLoadPhoto').addClass('d-none');
    $('#btnPhoto').removeClass('d-none');
});
    

$( "#btnPhoto" ).click(function() {
    var canvas = $('#canvasPhoto');
    var context = canvas.get(0).getContext("2d");
    var video = document.getElementById('videoPhoto');
    context.drawImage(video, 0, 0, 160, 120);
    
    canvas.removeClass('d-none');
    $('#videoPhoto').addClass('d-none');
    $('#btnPhoto').addClass('d-none');
    $('#btnSalvarPhoto').removeClass('d-none');
});

$( "#btnSalvarPhoto" ).click(function() {
    var canvas = document.getElementById('canvasPhoto');
    var dataURL = canvas.toDataURL('image/jpeg');
    var u8Image  = b64ToUint8Array(dataURL);
    var idPhoto = $('#idPhoto').val();
    var idSite = $('#idSite').val();

    var formData = new FormData();
    formData.append("photo", new Blob([ u8Image ], {type: "image/jpg"}), "foto" + idPhoto + ".jpg");
    formData.append('idSite', idSite);
    formData.append('idPhoto', idPhoto);

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function(e){uploadCompleteImage(e)}, false);
    xhr.open("POST", "/portal/RecebeImagem", true);
    xhr.send(formData);
});

function b64ToUint8Array(b64Image) {
    var img = atob(b64Image.split(',')[1]);
    var img_buffer = [];
    var i = 0;
    while (i < img.length) {
       img_buffer.push(img.charCodeAt(i));
       i++;
    }
    return new Uint8Array(img_buffer);
}

function uploadCompleteImage(e) {
    $('#canvasPhoto').addClass('d-none');
    $('#btnSalvarPhoto').addClass('d-none');
    $('#btnLoadPhoto').removeClass('d-none');
    setTimeout(updatePhoto, 500);
}

function updatePhoto() {
    $.getJSON("/portal/updatePhoto", {format: "json"}).done(function(data) {
        var foto = "/fotoaluno/foto" +  $('#token').val() + ".jpg";
        $("#photoImg").attr("src", foto + "?timestamp=" + data);
    });

}