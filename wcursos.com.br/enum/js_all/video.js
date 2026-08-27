var contadorTentativas = 0;
var player = null;
var tempo = null;
var idTimeout = null;

function loadVideo(tempoUltimo, restartSamba) {
	$('#modalFooter1').show();
	$('#modalDialog1').width('100%');
	$('#modalDialog1').height('100%');
	$('#btnMaterial').show();
	$('#btnDuvida').show();
    $('#btnAnotacoes').show();
	if ($('#btnDownloadTrilha').length > 0) $('#btnDownloadTrilha').hide();
	if ($('#btnDownload').length > 0) $('#btnDownload').hide();
	$('#btnFavoritos').show();
	$('#btnAvancar').show();
	$('#btnRetroceder').show();
	$('#btnTopico').show();
	$('#divClassificacao').show();
    $('#modalDialog1').css('max-width','100%');
    $('.modal-content').css('background-color','#FFFFFF');
	if ($('#btnFechar').length > 0) $('#btnFechar').prop('disabled',false);
	if ($('#btnClose1').length > 0) $('#btnClose1').prop('disabled',false);
	if ($('#btnAvancar').length > 0) $('#btnAvancar').prop('disabled',false);
	if ($('#btnRetroceder').length > 0) $('#btnRetroceder').prop('disabled',false);

	if ($('#tituloNomeAula').length > 0) {
		$('#tituloNomeAula').tooltip('dispose');
		$('#tituloNomeAula').html($('#nomeAula').val()).attr('title', $('#nomeAula').val()).tooltip();
	}
	
	$('#modalBodyMedia').css('overflowY', '');	
	var heightVideo = $(window).height() - 104;
	if (heightVideo < 100) {
		if ($('#modalBodyMedia').height() < 100) {
			if ($('#modalContent').height() > 100) {
				heightVideo = $('#modalContent').height();
			}
		} else {
			heightVideo = $('#modalBodyMedia').height();
		}
	}
	if ($(window).width() < 768) {
		heightVideo = '100%';
	}
	if($('#tipoCurso').val() == 'V') heightVideo = $('#modalBodyMedia').height();
	if($('#tipoVideo').val() == 'R') {
		document.getElementById("videoTutor1").style.height = heightVideo;
		$('#videoTutor1').css('height', heightVideo + 'px')
		//document.getElementById("videoTutor2").style.height = heightVideo;
		//$('#videoTutor2').css('height', heightVideo + 'px')
	}
	$('#divBlocoNota').height(heightVideo);
	$('#divTopico').height(heightVideo);
	$('#divVideoMaterial').height(heightVideo);
	$('#btnCloseMaterial').click(function() {
		$('#divVideoMaterial').addClass('d-none');
		$('#divVideoMaterial').removeClass('col-md-3');
		$('#divVideoVideo').removeClass('col-md-9');
		$('#divVideoVideo').addClass('col-md-12');
	});
	$('#btnCloseDuvida').click(function() {
		$('#divDuvida').addClass('d-none');
		$('#divDuvida').removeClass('col-md-3');
		$('#divVideoVideo').removeClass('col-md-9');
		$('#divVideoVideo').addClass('col-md-12');
	});	
	$('#btnSizeMaterial').click(function() {
		if ($('#divVideoVideo').hasClass('col-md-9') == true) {
			$('#divVideoVideo').addClass('col-md-6');
			$('#divVideoVideo').removeClass('col-md-9');
			$('#divVideoMaterial').addClass('col-md-6');
			$('#divVideoMaterial').removeClass('col-md-3');
		} else if ($('#divVideoVideo').hasClass('col-md-6') == true) {
			$('#divVideoVideo').addClass('col-md-3');
			$('#divVideoVideo').removeClass('col-md-6');
			$('#divVideoMaterial').addClass('col-md-9');
			$('#divVideoMaterial').removeClass('col-md-6');
		} else if ($('#divVideoVideo').hasClass('col-md-3') == true) {
			$('#divVideoVideo').addClass('col-md-9');
			$('#divVideoVideo').removeClass('col-md-3');
			$('#divVideoMaterial').addClass('col-md-3');
			$('#divVideoMaterial').removeClass('col-md-9');
		}
	});

	$('[name="btnMaterialDownload"]').click(function() {
		$('#btnMaterialDownload' + $(this).data('value')).prop("disabled","true");
		var id = $(this).data('value');
		var token = $(this).data('token');
		
		var path = $(this).data('path');
		var posicao = $(this).data('posicao');
		if (path.toLowerCase().substr(-3) != 'pdf') posicao = 0;
	
		gerarPDFStamper(posicao, id, 'D', token, 'btnMaterialDownload' + id, null, null);
	});

	$('[name="btnMaterialViewVideo"]').click(function() {
		$('#listDocuments').hide();
		$('#iFrameDocument').hide();
		$('#btnListMaterial').show();
		$('#divDocument').hide();
		if ((($(this).data('tipo') == 'D' && $(this).data('mobile') == false) || $(this).data('tipo') == 'L')) {
			$('#iFrameDocument').show();
		} else if ($(this).data('tipo') == 'S' || $(this).data('mobile') == true) {
			$('#divDocument').show();
		}
		$('#divDocument').height(heightVideo);
		$('#iFrameDocument').height(heightVideo - 40);
		var posicao = $(this).data('posicao');
		if ($(this).data('path').toLowerCase().substr(-3) != 'pdf') posicao = 0;

		carregarMaterial($(this).data('tipo'), $(this).data('value'), $(this).data('token'), $(this).data('path'), $(this).data('inicial'), $(this).data('final'), 'divDocument', 'iFrameDocument', posicao, $(this).data('mobile'));
	});

	$('#btnListMaterial').click(function() {
		if ($('#listDocuments').is(":visible") == true){
			$('#listDocuments').hide();
		} else {
			$('#listDocuments').show();
		}
	});

	if($('#tipoVideo').val() == 'S') {
		if ((restartSamba != '' && restartSamba == 'false') || tempoUltimo == 0) {
			    player = new SambaPlayer("player", {
				height: heightVideo + 'px',
				width: "100%",
				ph: $('#local').val(),
				m: $('#path').val(),
				playerParams: {
					enableShare: false,
					html5: true
				},
				events: {
					"onStart": "eventListener",
					"onFinish": "eventListener",
					"onSeek": "eventListener",
					"onPause": "eventListener",
					"onResume": "eventListener",
					"onListen": "eventListener"
				}
			});
		} else {
			    player = new SambaPlayer("player", {
				height: heightVideo + 'px',
				width: "100%",
				ph: $('#local').val(),
				m: $('#path').val(),
				playerParams: {
					enableShare: false,
					html5: true,
					resume: tempoUltimo
				},
				events: {
					"onStart": "eventListener",
					"onFinish": "eventListener",
					"onSeek": "eventListener",
					"onPause": "eventListener",
					"onResume": "eventListener",
					"onListen": "eventListener"
				}
			});
		}
	} else if($('#tipoVideo').val() == 'B' || 
	          $('#tipoVideo').val() == 'M' || 
	          $('#tipoVideo').val() == 'H' || 
	          $('#tipoVideo').val() == 'E' ||
	          $('#tipoVideo').val() == 'X' ||
	          $('#tipoVideo').val() == 'L' ||
	          $('#tipoVideo').val() == 'Z') {
		$('#btnDuvida').hide();
		marcarVideoVisto(1);
		clearTimeout(idTimeout);
		idTimeout = setTimeout(temporizadorAoVivo, 1000);
	} else if($('#tipoVideo').val() == 'Z') {
		$('#player').height(heightVideo);
		marcarVideoVisto(1);
	} else if($('#tipoVideo').val() == 'W') {
		$('#player').height(heightVideo);
		marcarVideoVisto(1);
	} else if($('#tipoVideo').val() == 'I') {
		$('#player').height(heightVideo);
	    var iframe = $('#player')[0];
		player = new Vimeo.Player(iframe);	
		player.on('play', onPlay);
	    player.on('seeked', onSeek);
	    player.on('pause', onPause);
	    player.on('ended', onFinish);
	    player.on('timeupdate', onProgress);

		function onPlay() {
		    player.getCurrentTime().then(function(value, player_id) {
				contaLog(value);
		    }).catch(function(error) {
		        console.error('error:', error.name);
		    });
		}
		function onPause() {
			player.getCurrentTime().then(function(value, player_id) {
				contaLog(value);
			}).catch(function(error) {
			    console.error('error:', error.name);
			});
		}
		function onSeek() {
		    player.getCurrentTime().then(function(value, player_id) {
				contaLog(value);
		    }).catch(function(error) {
		        console.error('error:', error.name);
		    });
		}
		function onFinish() {
		    player.getCurrentTime().then(function(value, player_id) {
				contaLog(value);
				sincronizarVideo(true);
			}).catch(function(error) {
		        console.error('error:', error.name);
		    });
		}
		function onProgress(data) {
			contaLog(data.seconds);
		}
	} else if($('#tipoVideo').val() == 'R') {
		const iframe = document.getElementById('videoTutor1');
      	const player = VdoPlayer.getInstance(iframe);
	
 		player.video.addEventListener("play", function () {
			contaLog(player.video.currentTime);
      	});
 		player.video.addEventListener("pause", function () {
			contaLog(player.video.currentTime);
      	});
 		player.video.addEventListener("seeked", function () {
			contaLog(player.video.currentTime);
      	});
 		player.video.addEventListener("ended", function () {
			contaLog(player.video.currentTime);
			sincronizarVideo(true);
      	});
      
		setInterval(temporizadorVdoCipher, 1000)
		
	} else if($('#tipoVideo').val() == 'Y') {
		player = new Plyr('#player');

		player.on('ready', event => {
			$('.plyr--video').height(heightVideo);
			$('.plyr__video-wrapper').css('height', '100%');
			$('#divVideoVideo iframe').height(heightVideo);
			player.play();
		});		
		player.on('play', event => {
			contaLog(player.currentTime);
		});		
		player.on('pause', event => {
			contaLog(player.currentTime);
		});		
		player.on('enterfullscreen', event => {
			$('#divVideoVideo iframe').height('100%');
		});		
		player.on('exitfullscreen', event => {
			$('#divVideoVideo iframe').height(heightVideo);
		});		
		player.on('ended', event => {
			contaLog(player.currentTime);
			sincronizarVideo(true);
		});		
		player.on('seeked', event => {
			contaLog(player.currentTime);
		});		
		setInterval(temporizadorY, 1000)

	} else if($('#tipoVideo').val() == 'F') {
		
		var alturaVF = $('.videofrontplayer').height();
		var proporcao = alturaVF / heightVideo;
		var larguraVF = $('.videofrontplayer').width();
		var novaLargura = larguraVF / proporcao;
		$('.videofrontplayer').height(heightVideo);
		$('.videofrontplayer').css('max-height', heightVideo);
		$('.videofrontplayer').width(novaLargura);
		//$('.videofrontplayer').css('max-width', novaLargura);
		$('.videofrontplayer').css('width', '100%');

		window.addEventListener ("videoteca-loaded", function ( evt ) {
			$ ('.videofrontplayer').height(heightVideo);
			if (typeof videofrontVideoApi !== "undefined") {
				videofrontVideoApi.on('play', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('finish', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					sincronizarVideo(true);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('ended', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					sincronizarVideo(true);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('pause', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('progress', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('seek', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('seeked', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('stop', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
			}
		});		
	
		//Começa de onde parou		
		if (tempoUltimo != null && tempoUltimo > 0 && $('#VideoTecaMediaType').val() == 'video') {
			var iframeElement = document.querySelector('#divVideoVideo .videofrontplayer');
			if (iframeElement) {
	    		iframeElement.src += 'currentTime=' + tempoUltimo;
				tempo = tempoUltimo;
			}
		}
		//Registra eventos
		window.addEventListener ( "message", receiveEvents, false );

	} else if($('#tipoVideo').val() == '2') {
		
		var alturaVF = $('.videofrontplayer').height();
		var proporcao = alturaVF / heightVideo;
		var larguraVF = $('.videofrontplayer').width();
		var novaLargura = larguraVF / proporcao;
		$('.videofrontplayer').height(heightVideo);
		$('.videofrontplayer').css('max-height', heightVideo);
		$('.videofrontplayer').width(novaLargura);
		//$('.videofrontplayer').css('max-width', novaLargura);
		$('.videofrontplayer').css('width', '100%');

		window.addEventListener ("videoteca-loaded", function ( evt ) {
			$ ('.videofrontplayer').height(heightVideo);
			if (typeof videofrontVideoApi !== "undefined") {
				videofrontVideoApi.on('play', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('finish', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					sincronizarVideo(true);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('ended', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					sincronizarVideo(true);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('pause', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('progress', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('seek', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('seeked', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
				videofrontVideoApi.on('stop', function (e, api, video) {
					contaLog(videofrontplayer.video.time);
					transcricaoTextoAndamento(videofrontplayer.video.time);
				});
			}
		});		
	
		//Começa de onde parou		
		if (tempoUltimo != null && tempoUltimo > 0) {
			var iframeElement = document.querySelector('#divVideoVideo .videofrontplayer');
			if (iframeElement) {
	    		iframeElement.src += 'currentTime=' + tempoUltimo;
				tempo = tempoUltimo;
			}
		}
		//Registra eventos
		window.addEventListener ( "message", receiveEvents, false );

	} else if($('#tipoVideo').val() == 'U') {
		$('iframe').each(function () {
			$(this).height(heightVideo);
			$(this).width('100%');
		});
		$('#player').each(function () {
			$(this).height(heightVideo);
			$(this).width('100%');
		});
	} else if($('#tipoVideo').val() == 'D') {
		var audio = document.getElementById('aulaAudio');
		audio.addEventListener('timeupdate',function(){
			var currentTime = audio.currentTime;
			if (currentTime > 0) {
				contaLog(currentTime);
			}
		},false);
	}
	setInterval(temporizador, 10000)
	
	//idChatMultimedia
	if ($('#idChatMultimedia').val() > 0) {
	    if ($('#btnChat').length > 0) $('#btnChat').show();
	    if ($('.div-chat').length > 0) $('.div-chat').show();
	} else {
		if ($('#btnChat').length > 0)  $('#btnChat').hide();
		if ($('.div-chat').length > 0) $('.div-chat').hide();
	}
	//load favorito
	if ($('#favorito').length > 0) {
		if ($('#favorito').val() == 'true') {
			if ($('#iconeMediaFavorito').length > 0) $('#iconeMediaFavorito').prop('class', 'fas fa-star');
			if ($('#iconeMediaFavorito4').length > 0) $('#iconeMediaFavorito4').prop('checked', 'checked');
			if ($('#iconeMediaFavorito4').length > 0) $('#iiconeMediaFavorito4').css('color', '#fa0300');
			if ($('#iconeMediaFavorito5').length > 0) $('#iconeMediaFavorito5').removeAttr('checked');
			if ($('#iiconeMediaFavorito5').length > 0) $('#iiconeMediaFavorito5').css('color', '#dedee6'); 
			if ($('#iconeMediaFavorito6').length > 0) $('#iconeMediaFavorito6').prop('checked', 'checked');
			if ($('#iiconeMediaFavorito6').length > 0) $('#iiconeMediaFavorito6').css("font-weight", "bold"); 
			
		} else {
			if ($('#iconeMediaFavorito').length > 0) $('#iconeMediaFavorito').prop('class', 'far fa-star');
			if ($('#iconeMediaFavorito4').length > 0) $('#iconeMediaFavorito4').removeAttr('checked');
			if ($('#iconeMediaFavorito4').length > 0) $('#iiconeMediaFavorito4').css('color', '#dedee6'); 
			if ($('#iconeMediaFavorito5').length > 0) $('#iconeMediaFavorito5').prop('checked', 'checked');
			if ($('#iiconeMediaFavorito5').length > 0) $('#iiconeMediaFavorito5').css('color', '#fa0300');
			if ($('#iconeMediaFavorito6').length > 0) $('#iconeMediaFavorito6').removeAttr('checked');
			if ($('#iiconeMediaFavorito6').length > 0) $('#iiconeMediaFavorito6').css("font-weight", "lighter"); 
		}
	}
	if ($('#classificacao').length > 0) {
		for(var i = 1; i <= 5; i++){
			if ($('#star' + i).length > 0) $('#star' + i).attr('class','fas fa-star star-unchecked');
		} 
		for(var i = 1; i <= $('#classificacao').val(); i++){
			if ($('#star' + i).length > 0) $('#star' + i).attr('class','fas fa-star star-checked selected');
		} 
		
		if ($('#classificacao').val() > 0) {
			$('#star-' + $('#classificacao').val()).prop('checked', true);
		} else {
			$('#star-1').prop('checked', false);
			$('#star-2').prop('checked', false);
			$('#star-3').prop('checked', false);
			$('#star-4').prop('checked', false);
			$('#star-5').prop('checked', false);
		}
	}	

}

function receiveEvents ( event ) {
	
	var currentTimeLocal = event.data.currentTime;
	if (typeof currentTimeLocal === "undefined"  && typeof event.data.data !== "undefined" && typeof event.data.data.currentTime !== "undefined") { 
		currentTimeLocal = event.data.data.currentTime;
	}
	
    if ( typeof event.data.localMensagem !== "undefined" && event.data.localMensagem !== "vfplayer" ) {
	    if ( event.data.type == "timeupdate" || event.data.event == "player-timeupdate") {
			contaLog(currentTimeLocal);
	    	transcricaoTextoAndamento(currentTimeLocal);
		}
        return;
    } else {
	    if ( event.data.type == "timeupdate" || event.data.event == "timeupdate") {
			contaLog(currentTimeLocal);
	    	transcricaoTextoAndamento(currentTimeLocal);
	    	return;
		}
	}
    if ( event.data.type == "play" || event.data.event == "player-play" ) {
		contaLog(currentTimeLocal);
    	transcricaoTextoAndamento(currentTimeLocal);
	}

    if ( event.data.type == "ended" || event.data.event == "player-ended" ) {
		contaLog(currentTimeLocal);
		sincronizarVideo(true);
    	transcricaoTextoAndamento(currentTimeLocal);
	}

    if ( event.data.type == "pause" || event.data.event == "player-pause" ) {
		contaLog(currentTimeLocal);
    	transcricaoTextoAndamento(currentTimeLocal);
	}
 
    if ( event.data.type == "seeked" || event.data.event == "player-seeked" ) {
		contaLog(currentTimeLocal);
    	transcricaoTextoAndamento(currentTimeLocal);
	}    
}


function eventListener(player) {
	if (player.event == 'onListen') {
		contaLog(player.eventParam);
	} else if (player.event == 'onFinish') {
		sincronizarVideo(true);
	}
}

function contaLog(tempoParam) {
	
	if ($('#idVideo').val() === undefined) return;
	
	if (typeof tempoParam === 'undefined') return;
	tempo = tempoParam;
	if ($('#tempoVideo').length > 0) $('#tempoVideo').val(tempo); 

	var data = localStorage.getItem("TUTOR2-" + $('#token').val() + '-' + $('#idVideo').val() + '-' + $('#tipoVideo').val());
	if (data != null){
		var arrayTempo = data.split('-');
		if (arrayTempo.length == 6) {
			tempTempo = tempoParam - parseFloat(arrayTempo[2]);
			if (tempTempo > 0 && tempTempo < 2) {
				tempoTotal = parseFloat(arrayTempo[0]) + tempTempo
			} else {
				tempoTotal = parseFloat(arrayTempo[0]);
			}
			if (arrayTempo[1] == 'Nan') arrayTempo[1] = 0;
			if (tempoParam > parseFloat(arrayTempo[1])) {
				tempoMax = tempoParam;
			} else {
				tempoMax = parseFloat(arrayTempo[1]);
			}
		}
	} else {
		tempoTotal = 0;
		tempoMax = tempoParam;	
	}
	//console.log('ContaLog:' + tempoTotal + '-' + tempoMax + '-' + tempoParam + '-' + $('#controleDuracao').val() + '-' + $('#controleConsumo').val() + '-' + $('#controlePercentual').val());
	localStorage.setItem("TUTOR2-" + $('#token').val() + '-' + $('#idVideo').val() + '-' + $('#tipoVideo').val(),  tempoTotal + '-' + tempoMax + '-' + tempoParam + '-' + $('#controleDuracao').val() + '-' + $('#controleConsumo').val() + '-' + $('#controlePercentual').val());
}

function temporizador() {
	var identificador = document.getElementById("identificador");
	if (identificador != null) {
		var esquerda = Math.floor((Math.random() * 640)+1);
		var topo = Math.floor((Math.random() * 360)+1);
		identificador.style.top = topo + 'px';
		identificador.style.left = esquerda + 'px';
	}
	var hora = getCompleteDate();
	localStorage.setItem("TUTOR-TIME", hora);
}

function temporizadorY() {
	if (player.currentTime > 0) {
		contaLog(player.currentTime);
	}
}

function temporizadorVdoCipher() {
	const iframe = document.getElementById('videoTutor1');
  	const player = VdoPlayer.getInstance(iframe);
	if (player.video.currentTime > 0) {
		contaLog(player.video.currentTime);
	}
}

function temporizadorAoVivo() {
	
	if ($('#tipoVideo').length == 0) return;
	if ($('#tipoVideo').val() != 'B' &&
		$('#tipoVideo').val() != 'L' &&
		$('#tipoVideo').val() != 'M' &&
		$('#tipoVideo').val() != 'E' &&
		$('#tipoVideo').val() != 'H' &&
		$('#tipoVideo').val() != 'Z' &&
		$('#tipoVideo').val() != 'X') return;
	if ($('#tempoAoVivo').val() == 'undefined')  $('#tempoAoVivo').val(0);
	$('#tempoAoVivo').val(parseInt($('#tempoAoVivo').val()) + 1); 
	const tempo = parseInt($('#tempoAoVivo').val());
	contaLog(tempo);
	if (!isNaN(tempo) && tempo % 300 === 0) {
		sincronizarVideo(true);
	}
	clearTimeout(idTimeout);
	idTimeout = setTimeout(temporizadorAoVivo, 1000);
}

function enviarDuvida() {
    if(!$("#inquiryForm").valid()){
        return;
	}
   	$('#btnVideoInquirySend').prop('disabled', true);
	$("#tipoCursoDuvida").val($("#tipoCurso").val());
	$("#idVideoDuvida").val($("#idVideo").val());
	$("#tokenDuvida").val($("#token").val());

	var controle = $("#assunto").val() + $("#mensagem").val();
	var controleSalvo = window.localStorage.getItem('controle');

	if (controle == controleSalvo) return;
    window.localStorage.setItem('controle', controle);

	if (typeof $("#tempoDuvida") !== 'undefined' && tempo !== undefined && tempo != null && tempo > 0) {
		$("#tempoDuvida").val(tempo);
	} else {
		$("#tempoDuvida").val(0);
	}

    $.post("/portal/salvarDuvidaVideo", $("#inquiryForm").serialize(), function (data) {
    	if (data.status == 0) {
			$("#tipoCursoDuvida").val('');
			$("#idVideoDuvida").val(0);
			$("#idCursoDuvida").val(0);
			$("#tempoDuvida").val(0);
			$("#assunto").val('');
			$("#mensagem").val('');
			$.notify({icon: 'glyphicon glyphicon glyphicon-ok', message: 'Dúvida enviada com sucesso!'},{type: 'info', z_index: 1000000, delay: 1000});
   			$('#btnVideoInquirySend').prop('disabled', false);
   		} else {
   			alert(data.message);
   			$('#btnVideoInquirySend').prop('disabled', false);
      	}
    }, 'json');
}

function marcarVideoVisto(visto) {

	marcarVisto($('#token').val(), 
				$('#idVideo').val(), 
				visto);

}

function transcricaoTextoAndamento(tempo) {
	if (typeof tempo !== "undefined") {
		tempoInt = parseInt(tempo);
		const palavras = document.querySelectorAll('.t-selected');
	  	palavras.forEach(palavra => {
	  		palavra.classList.remove('t-selected');
	  	});
	  	
	  	let elementos = document.querySelectorAll('.t-' + tempoInt); 
		elementos.forEach(function(elemento) {
	    	elemento.classList.add('t-selected');
	 	});

	}
}

