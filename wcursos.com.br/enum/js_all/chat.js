var webSocket;
var sala = '';

function _now() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
}

function loadChat() {

    
    if ($('#format').val() != '1') {
        $('#modalDialog1').css('max-width', '600px').width('100%');
        $('#modalFooter1').hide().show();
        $('.modal-content').css('background-color', 'transparent');

        $('#btnMaterial, #btnChat, #btnDownload, #btnFavoritos, #btnDuvida').hide();
        $('#divClassificacao').attr('style', 'display:none!important');
        $('#btnAnotacoes').attr('style', 'display:none!important');
        $('#modalBodyMedia').css('overflowY', '');

        var heightVideo = $(window).height() - 104;
        if (heightVideo < 100) {
            heightVideo = ($('#modalBodyMedia').height() >= 100)
                ? $('#modalBodyMedia').height()
                : ($('#modalContent').height() > 100 ? $('#modalContent').height() : 100);
        }
        if ($('#tipoCurso').val() == 'V') heightVideo = $('#modalBodyMedia').height();
        $('#chatWindow').height(heightVideo - 20);
    }

    
    $('#textMessage').keyup(function (e) {
        if (e.keyCode === 13) sendMessage();
    });
    $('#btnEnviarMessage').click(function () {
        sendMessage();
    });

    
    if ($('#flagLoading').val() == 2) {
        sala = 'sala-' + $('#idChatMultimedia').val()
             + '-' + $('#tokenAluno').val()
             + '-' + $('#tokenProfessor').val();

        webSocket = new WebSocket('wss://' + window.location.href.split('/')[2] + '/portal/chat-server?sala=' + sala);

        webSocket.onmessage = function (message) {
            if (message.data === sala) buscaMensagem(1, 0);
        };
        webSocket.onopen = function () {
            buscaMensagem(1, 0);
        };
    } else {
        buscaMensagem(1, 1);
    }

    
    var params = {}, r = /([^&=]+)=?([^&]*)/g, match;
    function d(s) { return decodeURIComponent(s.replace(/\+/g, ' ')); }
    var search = window.location.search;
    while ((match = r.exec(search.substring(1)))) {
        var val = d(match[2]);
        params[d(match[1])] = (val === 'true') ? true : (val === 'false') ? false : val;
    }
    window.params = params;
}

function sendMessage() {
    var texto = document.getElementById('textMessage').value;
    if (!texto.length) return;

    $.post('/portal/addMessage', {
        idChatMultimedia : $('#idChatMultimedia').val(),
        mensagem         : texto,
        tokenAluno       : $('#tokenAluno').val(),
        tokenProfessor   : $('#tokenProfessor').val()
    }, function (data) {
        if ($('#flagLoading').val() == 2) {
            webSocket.send(sala);
        } else {
            receiveMessage(data.listaChatMensagem, data.token, 1);
        }
    }, 'json');

    document.getElementById('textMessage').value = '';
}

function buscaMensagem(scroll, loop) {
    var chatVisivel = $('#divVideoChat').attr('class') !== 'd-none'
        || ($('#divVideoChat4').length > 0 && $('#divVideoChat5').attr('class') !== 'd-none')
        || ($('#divVideoChat5').length > 0 && $('#divVideoChat4').attr('class') !== 'd-none');

    if (!chatVisivel) return;

    $.getJSON('/portal/readMessage', {
        format         : 'json',
        idChatMultimedia : $('#idChatMultimedia').val(),
        tokenAluno     : $('#tokenAluno').val(),
        tokenProfessor : $('#tokenProfessor').val()
    }).done(function (data) {
        receiveMessage(data.listaChatMensagem, data.token, scroll);
    });

    if (loop == 1) {
        setTimeout(function () { buscaMensagem(0, 1); }, 15000);
    }
}

function receiveMessage(listaMensagem, tokenUser, scroll) {
    for (var j = 0; j < listaMensagem.length; j++) {
        var m = listaMensagem[j];
        addMensagemDiv(m.id, m.mensagem, m.nomeChat, m.tokenFoto, m.dataInclusaoString, m.situacao, tokenUser);
    }
    if (scroll == 1) {
        setTimeout(scrollChat, 500);
    }
}

function scrollChat() {
    var el = document.getElementById('divCxChat');
    if (el) el.scrollTop = el.scrollHeight;
}

function addMensagemDiv(idMensagem, mensagem, nome, tokenFoto, dataInclusao, situacao, tokenUser) {

    if (idMensagem <= $('#idMensagem').val()) return;

    var area = document.getElementById('divCxChat');

    if (situacao === 'A') {
        
        if (tokenUser !== tokenFoto) {
        }

        var isSelf   = (tokenUser === tokenFoto);
        var rowClass = isSelf ? 'msg-row right' : 'msg-row left';
        var inicial  = nome ? nome.substring(0, 1).toUpperCase() : '?';

        
        var avatarHtml = '<div id="divFoto-' + idMensagem + '" class="msg-avatar' + (isSelf ? ' self' : '') + '">'
            + '<img src="/fotoaluno/foto' + tokenFoto + '.jpg" '
            + 'onerror="this.parentNode.innerHTML=\'' + inicial + '\'" '
            + 'style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
            + '</div>';

        var metaHtml = '<div class="msg-meta">'
            + (!isSelf ? '<span class="sender">' + nome + '</span>' : '')
            + dataInclusao
            + '</div>';

        var li = document.createElement('li');
        li.className = rowClass;
        li.innerHTML = avatarHtml
            + '<div class="msg-bubble-wrap">'
            +   metaHtml
            +   '<div class="msg-bubble">' + mensagem + '</div>'
            + '</div>';

        area.appendChild(li);

    } else {
        
        var id        = $('#idChatMultimedia').val();
        var diretorio = $('#diretorio').val();

        var audio = document.createElement('audio');
        audio.src      = '${pageContext.request.contextPath}/extranet/chat.do?method=tocar'
                       + '&idChatMultimedia=' + id
                       + '&diretorio=' + diretorio
                       + '&arquivo=' + mensagem;
        audio.controls  = true;
        audio.className = 'msg-audio';
        area.appendChild(audio);
    }

    document.getElementById('idMensagem').value = idMensagem;
    area.scrollTop = area.scrollHeight;
}

function loadAudio() {
    var recordingDIV = document.querySelector('.recordrtc');

    recordingDIV.querySelector('#cancelar').onclick = function () {
        var button = document.getElementById('gravar');
        button.disabled = button.disableStateWaiting = true;
        setTimeout(function () { button.disabled = button.disableStateWaiting = false; }, 1000);

        function stopStream() {
            if (button.stream && button.stream.stop) { button.stream.stop(); button.stream = null; }
        }

        if (button.recordRTC) {
            if (button.recordRTC.length) {
                button.recordRTC[0].stopRecording(function () {
                    if (!button.recordRTC[1]) { stopStream(); return; }
                    button.recordRTC[1].stopRecording(stopStream);
                    _resetGravarUI();
                });
            } else {
                button.recordRTC.stopRecording(function () { stopStream(); _resetGravarUI(); });
            }
        }
        enviarMensagem('Cancelado o envio do áudio');
    };

    recordingDIV.querySelector('#gravar').onclick = function () {
        var button = this;

        if (button.className === 'btnGravarTocando') {
            button.disabled = button.disableStateWaiting = true;
            setTimeout(function () { button.disabled = button.disableStateWaiting = false; }, 2000);
            enviarMensagem('Gravação parada');

            function stopStream() {
                if (button.stream && button.stream.stop) { button.stream.stop(); button.stream = null; }
            }

            if (button.recordRTC) {
                if (button.recordRTC.length) {
                    button.recordRTC[0].stopRecording(function (url) {
                        if (!button.recordRTC[1]) {
                            button.recordingEndedCallback(url); stopStream();
                            saveToDiskOrOpenNewTab(button.recordRTC[0]); return;
                        }
                        button.recordRTC[1].stopRecording(function (url) {
                            button.recordingEndedCallback(url); stopStream();
                        });
                        document.getElementById('cancelar').style.display = 'none';
                    });
                } else {
                    button.recordRTC.stopRecording(function (url) {
                        button.recordingEndedCallback(url); stopStream();
                        document.getElementById('cancelar').style.display = 'none';
                        saveToDiskOrOpenNewTab(button.recordRTC);
                    });
                }
            }
            return;
        }

        button.disabled = true;

        captureAudio({
            onMediaCaptured: function (stream) {
                button.stream = stream;
                if (button.mediaCapturedCallback) button.mediaCapturedCallback();
                document.getElementById('gravar').className    = 'btnGravarTocando';
                document.getElementById('cancelar').className  = 'btnCancelarShow';
                document.getElementById('chatEscrito').style.display = 'none';
                enviarMensagem('Gravação iniciada');
                button.disabled = false;
            },
            onMediaStopped: function () {
                button.innerHTML = 'Iniciar Gravação';
                if (!button.disableStateWaiting) button.disabled = false;
            },
            onMediaCapturingFailed: function () {}
        });

        button.mediaCapturedCallback = function () {
            button.recordRTC = RecordRTC(button.stream, {
                type       : 'audio',
                bufferSize : typeof params.bufferSize === 'undefined' ? 0 : parseInt(params.bufferSize),
                sampleRate : typeof params.sampleRate === 'undefined' ? 44100 : parseInt(params.sampleRate),
                leftChannel: params.leftChannel  || false,
                disableLogs: params.disableLogs  || false,
                recorderType: webrtcDetectedBrowser === 'edge' ? StereoAudioRecorder : null
            });
            button.recordingEndedCallback = function () {};
            button.recordRTC.startRecording();
            document.getElementById('cancelar').style.display = 'block';
        };
    };
}

function _resetGravarUI() {
    document.getElementById('cancelar').className = 'btnCancelar';
    document.getElementById('gravar').className   = 'btnGravar';
    document.getElementById('chatEscrito').style.display = 'block';
}

function captureAudio(config) {
    captureUserMedia({ audio: true }, function (stream) {
        config.onMediaCaptured(stream);
        stream.onended = config.onMediaStopped;
    }, config.onMediaCapturingFailed);
}

function captureUserMedia(constraints, success, error) {
    navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error || function () {});
}

function saveToDiskOrOpenNewTab(recordRTC) {
    if (!recordRTC) return alert('Nenhuma gravação encontrada');
    uploadToServer(recordRTC, function (progress, fileURL) {
        if (progress === 'ended') window.open(fileURL);
    });
}

function uploadToServer(recordRTC, callback) {
    var blob       = recordRTC instanceof Blob ? recordRTC : recordRTC.blob;
    var nomeArquivo = $('#prefixo').val() + '-' + (Math.random() * 1000).toString().replace('.', '');
    nomeArquivo    += navigator.mozGetUserMedia ? '.ogg' : '.wav';
    enviarMensagem('Áudio sendo carregado, aguarde...');
    document.getElementById('gravar').className = 'btnGravarUpload';

    var formData = new FormData();
    formData.append('audio-arquivo',   nomeArquivo);
    formData.append('audio-diretorio', $('#diretorio').val());
    formData.append('audio-id',        $('#idChatMultimedia').val());
    formData.append('audio-pessoa',    '${USUARIO_LOGADO_PORTAL.id}');
    formData.append('audio-blob',      blob);

    makeXMLHttpRequest('/tutor/RecebeAudio', formData, function (progress) {
        if (progress !== 'upload-ended') callback(progress);
    });
}

function makeXMLHttpRequest(url, data, callback) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) callback('upload-ended');
    };
    req.upload.onloadstart = function ()      { callback('Upload started...'); };
    req.upload.onprogress  = function (e)     { callback('Upload ' + Math.round(e.loaded / e.total * 100) + '%'); };
    req.upload.onload      = function ()      { setUploadEndTime(); callback('progress-about-to-end'); };
    req.upload.onerror     = function (err)   { callback('Failed to upload to server'); console.error(err); };
    req.upload.onabort     = function (err)   { callback('Upload aborted.'); console.error(err); };
    req.open('POST', url);
    req.send(data);
}

function setUploadEndTime() { setTimeout(setUploadEnd, 5000); }
function setUploadEnd() {
    enviarMensagem('Áudio(s) Carregado(s)');
    document.getElementById('gravar').className = 'btnGravar';
    document.getElementById('chatEscrito').style.display = 'block';
    buscaMensagem(1, 1);
}

function enviarMensagem(mensagem) {
    var el = document.getElementById('divMensagem');
    if (el) el.innerHTML = mensagem;
}

function apagarArquivo(id, diretorio, arquivo) {
    if (confirm('Deseja realmente excluir o arquivo de áudio?')) {
        AudioAction.deleteAudio(id, diretorio, arquivo, getAudios);
    }
}