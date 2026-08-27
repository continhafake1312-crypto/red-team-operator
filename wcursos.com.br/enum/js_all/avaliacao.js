function loadAvaliacao() {
	$('#modalDialog1').width('100%');
	$('#modalDialog1').height('auto');
	$('#btnFavoritos').hide();
	$('#btnAnotacoes').hide();
	$('#btnAnotacoes').attr("style", "display: none !important");
	$('#btnChat').hide();
	$('#btnMaterial').hide();
	$('#btnDuvida').hide();
	if ($('#btnDownloadTrilha').length > 0) $('#btnDownloadTrilha').hide();
	if ($('#btnDownload').length > 0) $('#btnDownload').hide();
	$('#btnTopico').hide();
	$('#divClassificacao').hide();
	$('#divClassificacao').attr("style", "display: none !important");
	$('#modalDialog1').css('max-width', '100%');
	$('.modal-content').css('background-color', '#FFFFFF');
	$('#btnAvancar').show();
	$('#btnRetroceder').show();
	$('#modalFooter1').show();
	$('#modalBodyMedia').height('');
	$('#modalBodyMedia').css('overflowY', 'auto');
	$('#modal1').css('overflow', '');
	$('#modalFooter1').show();
	
	if ($('#tituloNomeAula').length > 0) {
		$('#tituloNomeAula').tooltip('dispose');
		$('#tituloNomeAula').html($('#nomeAula').val()).attr('title', $('#nomeAula').val()).tooltip();
	} 

	var heightVideo = $(window).height() - 74;
	if (heightVideo < 100) {
		if ($('#modalBodyMedia').height() < 100) {
			if ($('#modalContent').height() > 100) {
				heightVideo = $('#modalContent').height();
			}
		} else {
			heightVideo = $('#modalBodyMedia').height();
		}
	}
	$('#modalBodyMedia').css('height', heightVideo + 'px')

	$('#fileUpload').change(function() {
		var files = event.srcElement.files;
		receberVariosArquivos(files, $(this).data('type'), $(this).data('id'), $(this).data('directory'));
	});

	if ($(".img-viewer") != null && $(".img-viewer").length > 0) {
		setTimeout(carregarCorrecao, 2000);
	}

	if ($(".text-viewer") != null && $(".text-viewer").length > 0) {
		setTimeout(carregarCorrecao, 2000);
	}

	$('[data-method="gerarPDF"]').each(function(index) {
		gerarPDF($(this).data('div'), $(this).data('path'), 0, 0, carregarCorrecao);
	});	
	if ($("[data-date]").length > 0) {
		$("#TestAgendamentoForm").validate({
    		errorClass: 'text-danger',
    		errorElement: 'small'
		});
		$("[data-date]").mask('00/00/0000');
		$("[data-date]").datepicker({
			autoclose: true,
			todayHighlight: true,
			todayBtn: true,
			format: 'dd/mm/yyyy'
		});
	}
	
	$("select").each(function(index) {
		if ($(this).data('value') != '') {
			$(this).val($(this).data('value'));
			$(this).change();
		}
	});
	
	if ($('#uploadDropzone').length > 0) {
        inicializarUploadRedacao();
    }
	if ($('#divTesteCamera').length > 0) {
    	$('#btnRealizarAvaliacao').prop('disabled', true);
    	$('#btnRealizarAvaliacao').css('opacity', '0.45');
	}

	// Verifica se tem gravação salva de tentativa anterior
    initVideoDB(function(dbOk) {
        if (!dbOk) return;

        temGravacaoSalvaLocal(function(tem, qtdChunks) {
            if (!tem) return;

            // Só oferece reenvio se for a mesma avaliação
            recuperarMetaVideoDB('idAvaliacao', function(idAvaliacaoSalva) {
                var idAvaliacaoAtual = $('#idAvaliacao').val();

                if (idAvaliacaoSalva && idAvaliacaoSalva != idAvaliacaoAtual) {
                    // É de outra avaliação - descarta silenciosamente
                    console.log('[Recuperação] Gravação de outra avaliação - descartando');
                    limparVideoDB();
                    return;
                }

                recuperarMetaVideoDB('urlAssinada', function(urlSalva) {
                    if (!urlSalva) {
                        console.warn('[Recuperação] URL não encontrada - descartando');
                        limparVideoDB();
                        return;
                    }

                    _mostrarBannerRecuperacao(qtdChunks, urlSalva);
                });
            });
        });
    });
    
}

function abrirTelaRanking(idAvaliacao) {
	var url = '/portal/ranking?idAvaliacao=' + idAvaliacao;
	$.ajax({
		url: url,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			$('#modalBodyMedia').html(data);
		}
	});
}

function abrirTelaResultado(idAvaliacaoAluno) {

	var url = '/portal/test-result?idAvaliacaoAluno=' + idAvaliacaoAluno;
	$.ajax({
		url: url,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			$('#modalBodyMedia').html(data);
		}
	});
}

function abrirTelaAvaliacao(idAvaliacao, tipoCurso, idAlunoMensalidade, idCurso, idTopicoVideo, idHorarioMultimedia) {

	$("#btnRealizarAvaliacao").attr("disabled", true);
	$('#btnRealizarAvaliacao').html("<i class='fa fa-spinner fa-spin'></i> Aguarde Carregando...");

	var url = '/portal/realizarAvaliacao?idAvaliacao=' + idAvaliacao;
	url += '&tipoCurso=' + tipoCurso;
	url += '&idAlunoMensalidade=' + idAlunoMensalidade;
	url += '&idCurso=' + idCurso;
	if (idTopicoVideo != null && idTopicoVideo > 0 && idTopicoVideo != 'null') url += '&idTopicoVideo=' + idTopicoVideo;
	if (idHorarioMultimedia != null && idHorarioMultimedia > 0 && idHorarioMultimedia != 'null') url += '&idHorarioMultimedia=' + idHorarioMultimedia;
	 
	$.ajax({
		url: url,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			$('#modalBodyMedia').html(data);
			loadAvaliacao();
			restoreProgressLocal();
		}
	});
}
var mediaRecorder = null;

function loadAvaliacaoQuestao() {
	
	if ($('#tempoRestante').val() > 0) {
		conta();
	}

	$('#modalFooter1').show();
	if ($("#gravacao") != null && $("#gravacao").length > 0 && $("#gravacao").val() == 'S') {
		$(document).keydown(function(e) {
			if (e.keyCode == 91 || e.keyCode == 18 || e.keyCode == 17 || e.keyCode == 27 || e.keyCode == 13) {
				$('#btnAvaliacaoSalvar').prop('disabled',true);
				alert('Sua avaliação será anulada, você não pode usar as teclas: ESC, ALT e CONTROL ');
				anularAvaliacao();
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		});
		
		$('#modalFooter1').hide();
		$('#modal1').modal({ backdrop: 'static', keyboard: true });		
	}
	
	if ($("#gravacao") != null && $("#gravacao").length > 0 && $("#gravacao").val() == 'S') {
		
		toggleFullScreen();
		
		document.addEventListener('fullscreenchange', exitHandler, false);
		document.addEventListener('mozfullscreenchange', exitHandler, false);
		document.addEventListener('MSFullscreenChange', exitHandler, false);
		document.addEventListener('webkitfullscreenchange', exitHandler, false);

		function exitHandler() {
 			if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
				if ($('#btnAvaliacaoSalvar').data('clicou') != '1') {
					$('#btnAvaliacaoSalvar').prop('disabled',true);
					alert('Sua avaliação foi anulada, você não pode sair do modo tela cheia');
					anularAvaliacao();
				} 
 			}
		}
		
		initVideoDB(function(dbOk) {
		    if (!dbOk) {
		        console.warn('[IndexedDB] Banco não iniciou - gravação só na RAM');
		    }

			(async () => {
				
				navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		
				var signedURL = $('#urlAssinada').val();
				const chunks = [];
		
				var stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(err => {
					alert('Não estamos conseguindo usar sua câmera, você precisa ter uma câmera e estar com ela autorizada, o erro foi: ' + err.message + ', autorize a câmera e faça refresh na página.');
					$('#btnAvaliacaoSalvar').prop('disabled',true);
				});
				mediaRecorder = new MediaRecorder(stream, {
					type: 'video',
					mimeType: 'video/webm;codecs=h264,opus'
				});
				mediaRecorder.ondataavailable = e => {
					if (!e.data || e.data.size === 0) return;
	
					chunks.push(e.data);
					
					// Salva no IndexedDB simultaneamente
				    salvarChunkVideoDB(e.data, function(salvou) {
				        if (!salvou) {
				            console.warn('[Gravação] Chunk não salvo no IndexedDB - apenas na RAM');
				        }
				    });
				    
				};
				mediaRecorder.onstart = e => {
					window.onbeforeunload = () => { return "O vídeo ainda não foi salvo, deseja mesmo sair? Atenção: Isto anulará sua prova!"; };
					
					// Salva metadados para recuperação em caso de falha
				    salvarMetaVideoDB({ chave: 'idAvaliacao',        valor: $('#idAvaliacao').val() });
				    salvarMetaVideoDB({ chave: 'idAlunoMensalidade', valor: $('#idAlunoMensalidade').val() });
				    salvarMetaVideoDB({ chave: 'urlAssinada',        valor: $('#urlAssinada').val() });
				    salvarMetaVideoDB({ chave: 'iniciadoEm',         valor: new Date().toISOString() });
				    
				    console.log('[Gravação] Iniciada - salvando no IndexedDB');
				};
		
				mediaRecorder.onstop = e => {
				    stream.getTracks().forEach(function(track) {
				        if (track.readyState == 'live') track.stop();
				    });
				
				    // Recupera chunks do IndexedDB (mais confiável que a RAM)
				    recuperarChunksVideoDB(function(chunksDB) {
				
				        // Usa IndexedDB se tiver dados, senão usa o array da RAM como fallback
				        var fonteDados = (chunksDB && chunksDB.length > 0) ? chunksDB : chunks;
				        console.log('[Upload] Usando ' + (chunksDB.length > 0 ? 'IndexedDB' : 'RAM') + ' - ' + fonteDados.length + ' chunks');
				
				        var blob = new Blob(fonteDados, { type: 'video/webm' });
				        _enviarVideoComProgresso(blob, signedURL);
				    });
				};
		
				mediaRecorder.onerror = e => {
					alert('Houve um erro crítico em seu navegador e sua gravação foi corrompida, com isso não será possível salvar a avaliação, faça um refresh na página e refaça a avaliação. ERROR: ' + e.error.name);
					$('#btnAvaliacaoSalvar').prop('disabled',true);
					window.onbeforeunload = null;
				};
		
				if (mediaRecorder.state != 'recording') {
					mediaRecorder.start(3000);
				}
			})();
		});
	} else if ($("#gravacao") != null && $("#gravacao").length > 0 && $("#gravacao").val() == 'F') {
		
		if ($('#btnFechar').length > 0) $('#btnFechar').prop('disabled',true);
		if ($('#btnClose1').length > 0) $('#btnClose1').prop('disabled',true);
		if ($('#btnAvancar').length > 0) $('#btnAvancar').prop('disabled',true);
		if ($('#btnRetroceder').length > 0) $('#btnRetroceder').prop('disabled',true);
		
		toggleFullScreen();
		
		$('#modal1').modal('dispose');
		$('#modal1').modal({
  			backdrop: 'static',
  			keyboard: false
		}); 


		document.addEventListener('fullscreenchange', exitHandler, false);
		document.addEventListener('mozfullscreenchange', exitHandler, false);
		document.addEventListener('MSFullscreenChange', exitHandler, false);
		document.addEventListener('webkitfullscreenchange', exitHandler, false);

		function exitHandler() {
 			if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
				if ($('#btnAvaliacaoSalvar').data('clicou') != '1') {
					toggleFullScreen();
					return false;
				} 
 			}
		}

	}
}

function validarAvaliacao(form) {

	for (i = 0; i <= form.pergunta.length - 1; i++) {
		marcadoOpcao = false;
		$('[name=' + 'opcao' + form.pergunta[i].value + ']').each(function() {
			if ($(this).is(':checked') == true) {
				marcadoOpcao = true;
			}
		});
		if (marcadoOpcao == false) {
			alert('A pergunta ' + (i + 1) + ' não foi respondida. É necessário responder todas as perguntas.');
			return false;
		}
	}
	return true;
}

function salvar() {
	if (confirm("Tem certeza que deseja salvar e finalizar, depois desta ação não poderá mais alterar?")) {
		var form = document.getElementById('avaliacaoForm');
		$.post("/portal/salvarAvaliacao", $("#avaliacaoForm").serialize(), function(data) {
			$('#modalBodyMedia').html(data);
		}, 'html');
	}
}

function sair() {
	if (confirm("Tem certeza que deseja sair sem salvar?")) {
		$('#modal1').modal('hide');
	}
}

function fechar() {
	$('#modal1').modal('hide');
	$('#modal1').hide();
	$('.modal-backdrop').remove();
}

function conta() {
	if (document.getElementById('tempoTotal')) {
		total = document.getElementById('tempoTotal').value;
		contador = document.getElementById('tempoRestante').value;
		document.getElementById('divAvaliacaoCabecalhoTempoRestante').innerHTML = 'Tempo Restante: ' + seconds2time(contador);
		if (contador == 0) {
			salvarAvaliacao();
		}
		if (contador != 0) {
			contador = contador - 1;
			document.getElementById('tempoRestante').value = contador;
			document.getElementById('tempoDecorrido').value = total - contador;
			
			saveProgressLocal();
			
			setTimeout("conta()", 1000);
		}
	}
}

function seconds2time(seconds) {
	var hours = Math.floor(seconds / 3600);
	var minutes = Math.floor((seconds - (hours * 3600)) / 60);
	var seconds = seconds - (hours * 3600) - (minutes * 60);
	var time = "";

	if (hours != 0) {
		time = hours + ":";
	}
	if (minutes != 0 || time !== "") {
		minutes = (minutes < 10 && time !== "") ? "0" + minutes : String(minutes);
		time += minutes + ":";
	}
	if (time === "") {
		time = seconds + "s";
	}
	else {
		time += (seconds < 10) ? "0" + seconds : String(seconds);
	}
	return time;
}

class Avaliacao {
	constructor(idAvaliacao, tipoCurso, idCurso, idAlunoMensalidade, idTopicoVideo, idHorarioMultimedia, tempoDecorrido, tempoTotal, tempoRestante, listaQuestao) {
		this.idAvaliacao = idAvaliacao;
		this.idAlunoMensalidade = idAlunoMensalidade;
		this.tipoCurso = tipoCurso;
		this.idCurso = idCurso;
		this.idTopicoVideo = idTopicoVideo;
		this.idHorarioMultimedia = idHorarioMultimedia;
		this.tempoDecorrido = tempoDecorrido;
		this.tempoTotal = tempoTotal;
		this.tempoRestante = tempoRestante;
		this.listaQuestao = listaQuestao;
	}
}

class Questao {
	constructor(idQuestao, idAlternativa, respostaDiscursiva, tipo) {
		this.idQuestao = idQuestao;
		this.idAlternativa = idAlternativa;
		this.respostaDiscursiva = respostaDiscursiva;
		this.tipo = tipo;
	}
}

function salvarAvaliacaoAcao() {
	$("#btnAvaliacaoSalvar").attr("disabled", true);
	$("#btnAvaliacaoSalvar").text("Aguarde salvando...");
	if ($("#gravacao") != null && $("#gravacao").length > 0 && $("#gravacao").val() == 'S') {
		$('#btnAvaliacaoSalvar').data('clicou',1);
		if (mediaRecorder.state == 'recording') {
			mediaRecorder.stop();
		}
	} else if ($("#gravacao") != null && $("#gravacao").length > 0 && $("#gravacao").val() == 'F') {	
		cancelFullScreen();
		$('#btnAvaliacaoSalvar').data('clicou',1);

		setTimeout(continuarSalvando, 2000);

	} else {
		if (verificaBrancos() == false) {
			$("#btnAvaliacaoSalvar").attr("disabled", false);
			$("#btnAvaliacaoSalvar").text("Salvar e Finalizar");
			return;
		}
		
		if (confirm("Tem certeza que deseja salvar e finalizar, depois desta ação não poderá mais alterar?") == false) {
			$("#btnAvaliacaoSalvar").attr("disabled", false);
			$("#btnAvaliacaoSalvar").text("Salvar e Finalizar");
			return;
		}

		$('#btnAvaliacaoSalvar').data('clicou',1);
		salvarAvaliacao();
	}
}

function continuarSalvando() {
	if (verificaBrancos() == false) return;
	if (confirm("Tem certeza que deseja salvar e finalizar, depois desta ação não poderá mais alterar?") == false) {
		$("#btnAvaliacaoSalvar").attr("disabled", false);
		$("#btnAvaliacaoSalvar").text("Salvar e Finalizar");
		return;
	}


	$("#btnAvaliacaoSalvar").attr("disabled", true);
	$("#btnAvaliacaoSalvar").text("Aguarde salvando...");
	$('#btnAvaliacaoSalvar').data('clicou',1);
	salvarAvaliacao();

}
function verificaBrancos() {
	var listaQuestaoBranco = '';

	$('input[name^="pergunta"]').each(function() {
		var opcaoEscolhida = $('input[name^="opcao' + $(this).val() + '"]:checked').val();
		var tipoPergunta = $('input[name^="tipoPergunta' + $(this).val() + '"]').val();
		
		if (typeof opcaoEscolhida === "undefined") opcaoEscolhida = 0;
		if (opcaoEscolhida == 0 && tipoPergunta != 'D') {
			if (listaQuestaoBranco != '') listaQuestaoBranco += ', ';
			listaQuestaoBranco += $('#numeroQuestao' + $(this).val()).val(); 
		}
	});
	
	if (listaQuestaoBranco != '') {
		if (confirm('Percebemos que algumas perguntas não foram respondidas: ' + listaQuestaoBranco + '. Tem certeza de que deseja salvar suas respostas assim mesmo?') == false) {
			return false;
		} 
	}
	
	return true;

}
function salvarAvaliacao() {

	listaAvaliacao = new Array();
	$('input[name^="pergunta"]').each(function() {

		var opcaoEscolhida = $('input[name^="opcao' + $(this).val() + '"]:checked').val();
		if (typeof opcaoEscolhida === "undefined") opcaoEscolhida = 0;
		
		var respostaDiscursiva = '';
		if ($('textarea[name^="respostaDiscursiva' + $(this).val() + '"]').val() !== undefined) {
			respostaDiscursiva = encodeURIComponent($('textarea[name^="respostaDiscursiva' + $(this).val() + '"]').val().replace(/"/g, ''));
		}
		if (typeof respostaDiscursiva === "undefined") respostaDiscursiva = '';
		var tipoPergunta = $('input[name^="tipoPergunta' + $(this).val() + '"]').val();
		questao = new Questao($(this).val(), opcaoEscolhida, respostaDiscursiva, tipoPergunta);
		listaAvaliacao.push(questao);
	});
	
	avaliacao = new Avaliacao($('#idAvaliacao').val(), $('#tipoCurso').val(), $('#idCurso').val(), $('#idAlunoMensalidade').val(),
	                           $('#idTopicoVideo').val(), $('#idHorarioMultimedia').val(),
	                          $('#tempoDecorrido').val(), $('#tempoTotal').val(), $('#tempoRestante').val(), listaAvaliacao);
	
	var dataJson = JSON.stringify(avaliacao);
	$.post('/portal/salvarAvaliacao2', dataJson, function(dataReturn) {
	    if (dataReturn.message.length > 0) alert(dataReturn.message);
		
		clearProgressLocal();
		
		if (dataReturn.urlRetorno.length > 0) {
			$.ajax({
				url: dataReturn.urlRetorno,
				dataType: 'html',
				type: 'GET',
				async: true,
				success: function(data) {
					$('#modalBodyMedia').html(data);
				}
			});
			if (event != null) event.stopPropagation();
			
			if ($('#btnFechar').length > 0) $('#btnFechar').prop('disabled',false);
			if ($('#btnClose1').length > 0) $('#btnClose1').prop('disabled',false);
			if ($('#btnAvancar').length > 0) $('#btnAvancar').prop('disabled',false);
			if ($('#btnRetroceder').length > 0) $('#btnRetroceder').prop('disabled',false);
			
		}
	}, 'json')
	  .fail(function(xhr, status, error) {
	   var errorMessage = xhr.status + ': Erro no envio da avaliação:' + xhr.statusText
		alert('Error - ' + errorMessage);
	});	
}

function abrirTelaCartaoResposta(token, idAvaliacao) {
	$('#modalFrameCartaoResposta1').attr('src', '/portal/test-cartao-resposta?token=' + token + '&idAvaliacao=' + idAvaliacao);
	$('#modalCartaoResposta').modal('show');
}

function abrirTelaQuestaoComentada(token, idAvaliacao) {
	$('#tituloModalFrame2').html('Questões Comentadas')
	$('#modalFrameEstatistica1').attr('src', '/portal/test-comentario-video?token=' + token + '&idAvaliacao=' + idAvaliacao);
	$('#modalEstatistica').modal('show');
}

function abrirTelaGabarito(token, idAvaliacao) {
	$('#modalFrameCartaoResposta1').attr('src', '/portal/test-gabarito?token=' + token + '&idAvaliacao=' + idAvaliacao);
	$('#modalCartaoResposta').modal('show');
}


function abrirTelaEstatistica(tokenEstatistica, tipo) {
	$('#modalFrameEstatistica1').attr('src', '/portal/test-simulado-estatistica?token=' + tokenEstatistica + '&tipo=' + tipo);
	$('#modalEstatistica').modal('show');
}

function setTestSimuladoOpcao(idQuestao, idAlternativa) {
	$.post("/portal/setTestSimuladoOpcao", { token: $("#token").val(), idAvaliacao: $("#idAvaliacao").val(), idQuestao: idQuestao, idAlternativa: idAlternativa }, function(data) {
		$('.questao-' + idQuestao).each(function() {
			$(this).removeClass('alternativa-marcada');
		});
		$('.alternativa-' + idAlternativa).addClass('alternativa-marcada');
	}, 'json');
}

function setTestSimuladoFinalizar() {
	$.post("/portal/setTestSimuladoFinalizar", { token: $("#token").val(), idAvaliacao: $("#idAvaliacao").val() }, function(data) {
		fecharModalCartaoResposta();
	}); 
}

function fecharModalEstatistica() {
	if ($('#modalEstatistica').length > 0) {
		$('#modalEstatistica').modal('hide');
		$('#modalEstatistica').hide();
	} else if ($('#modalEstatistica', parent.document).length > 0) {
		parent.$('#modalEstatistica').modal('hide');
	}	
}

function fecharModalCartaoResposta() {
	if ($('#modalCartaoResposta').length > 0) {
		$('#modalCartaoResposta').modal('hide');
		$('#modalCartaoResposta').hide();
	} else if ($('#modalCartaoResposta', parent.document).length > 0) {
		parent.$('#modalCartaoResposta').modal('hide');
	}	
}


 function cancelFullScreen() {
    var el = document;
    var requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.exitFullscreen||el.webkitExitFullscreen;
    if (requestMethod) { 
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") { 
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

function requestFullScreen(el) {

    var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;

    if (requestMethod) { 
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") { 
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
    return false
}

function toggleFullScreen(el) {
    if (!el) {
        el = document.body; 
    }
    var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||  (document.mozFullScreen || document.webkitIsFullScreen);

    if (isInFullScreen) {
        cancelFullScreen();
    } else {
        requestFullScreen(el);
    }
    return false;
}
        
function anularAvaliacao() {
	
	avaliacao = new Avaliacao($('#idAvaliacao').val(), $('#tipoCurso').val(), $('#idCurso').val(), $('#idAlunoMensalidade').val(), 0, 0, 0, null);

	var dataJson = JSON.stringify(avaliacao);

	var request = $.ajax({
		url: '/portal/anularAvaliacao',
		type: 'POST',
		data: dataJson,
		dataType: 'json',
		async: true
	});
	request.done(function(dataReturn) {
		window.onbeforeunload = null;
		$('#modal1').modal('toggle');
		$('#modal1').modal('hide');
		$("#modal1").removeClass("in");
		$("#modal1").css("display","none");
		$(".modal-backdrop").css("display","none");
		location.reload();
	});	
}

function desabilitaOpcao(idOpcao) {
	if ($('#radioLetter' + idOpcao).css('text-decoration').indexOf('line-through') >= 0) {
		$('#radioLetter' + idOpcao).css('text-decoration', '');
		$('#strike' + idOpcao).css('text-decoration', '');
		$('#option' + idOpcao).css('opacity', '1');
		$("#radioLetter" + idOpcao).css('pointer-events', 'auto');
		$("#descr" + idOpcao).css('pointer-events', 'auto');
		$("#descr" + idOpcao).css('text-decoration', '');
	} else {
		$('#radioLetter' + idOpcao).css('text-decoration', 'line-through');
		$('#strike' + idOpcao).css('text-decoration', 'line-through');
		$('#option' + idOpcao).css('opacity', '0.3');
		$("#radioLetter" + idOpcao).css('pointer-events', 'none');
		$("#descr" + idOpcao).css('pointer-events', 'none');
		$("#descr" + idOpcao).css('text-decoration', 'line-through');
	}
}

function setRespostaQuestao(idQuestao, idAlternativa) {

	$('#radio' + idAlternativa).prop('checked', true);
	$('.radioLetter' + idQuestao).removeClass('opcao-marcada');
	$('#radioLetter' + idAlternativa).addClass('opcao-marcada');

	saveProgressLocal(idQuestao, idAlternativa);
}

function getProgressKey() {
    return "avaliacaoProgress_" + $("#idAvaliacao").val() + "_" + $("#idAlunoMensalidade").val();
}

function saveProgressLocal(idQuestao, idAlternativa) {
    let key = getProgressKey();
	
    let progress = JSON.parse(localStorage.getItem(key)) || {
        idAvaliacao: $("#idAvaliacao").val(),
        idAlunoMensalidade: $("#idAlunoMensalidade").val(),
        tempoDecorrido: 0,
        respostas: {}
    };

    if (idQuestao && idAlternativa) {
        progress.respostas[idQuestao] = {
            alternativa: idAlternativa,
            respostaDiscursiva: $('textarea[name^="respostaDiscursiva' + idQuestao + '"]').val() || ""
        };
    }

    progress.tempoDecorrido = $("#tempoDecorrido").val();

    localStorage.setItem(key, JSON.stringify(progress));
}

function restoreProgressLocal() {
    let key = getProgressKey();
    let progress = JSON.parse(localStorage.getItem(key));
    
    if (!progress) return;

    if (progress.tempoDecorrido) {
        $("#tempoDecorrido").val(progress.tempoDecorrido);
        $("#tempoRestante").val($("#tempoTotal").val() - progress.tempoDecorrido);
    }

    for (const q in progress.respostas) {
        let resposta = progress.respostas[q];
        if (resposta.alternativa && resposta.alternativa != 0) {
            $("#radio" + resposta.alternativa).prop("checked", true);
            $("#radioLetter" + resposta.alternativa).addClass("opcao-marcada");
        }
        if (resposta.respostaDiscursiva) {
            $('textarea[name^="respostaDiscursiva' + q + '"]').val(resposta.respostaDiscursiva);
        }
    }
}

function clearProgressLocal() {
    let key = getProgressKey();
    localStorage.removeItem(key);
}

var imagemOriginal = null;
var rotacaoAtual = 0;
var arquivoPdfOriginal = null;
var nomeArquivoOriginal = '';

function inicializarUploadRedacao() {
    var dropzone = document.getElementById('uploadDropzone');
    var fileInput = document.getElementById('fileUploadRedacao');
    
    dropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('drag-over');
    });
    
    dropzone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
    });
    
    dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
        
        var files = e.dataTransfer.files;
        if (files.length > 0) {
            processarArquivo(files[0]);
        }
    });
    
    dropzone.addEventListener('click', function(e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
            fileInput.click();
        }
    });
    
    fileInput.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            processarArquivo(this.files[0]);
        }
    });
}

function processarArquivo(file) {
    var extensoesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
    var extensao = file.name.split('.').pop().toLowerCase();
    
    if (extensoesPermitidas.indexOf(extensao) === -1) {
        alert('Formato não permitido. Use: JPG, PNG, GIF ou PDF');
        return;
    }
    
    if (file.size > 52428800) {
        alert('Arquivo muito grande. Máximo: 50MB');
        return;
    }
    
    nomeArquivoOriginal = file.name;
    rotacaoAtual = 0;
    $('#rotacaoAtual').val(0);
    $('#rotationDegrees').text('0°');
    
    $('#uploadArea').hide();
    $('#previewArea').show();
    $('#previewLoading').show();
    $('#nomeArquivoPreview').text(file.name);
    
    if (extensao === 'pdf') {
        arquivoPdfOriginal = file;
        $('#badgePdfOriginal').show();
        converterPdfParaImagem(file);
    } else {
        arquivoPdfOriginal = null;
        $('#badgePdfOriginal').hide();
        carregarImagem(file);
    }
}

function carregarImagem(file) {
    var reader = new FileReader();
    
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            imagemOriginal = img;
            desenharCanvas();
            $('#previewLoading').hide();
            $('#btnEnviarRedacao').prop('disabled', false);
        };
		img.onerror = function(e) {
		  console.error('[PDF->IMG] img.onerror', e);
		  console.error('[PDF->IMG] canvasFinal', {
		    w: canvasFinal.width,
		    h: canvasFinal.height,
		    area: canvasFinal.width * canvasFinal.height
		  });
		  console.error('[PDF->IMG] src head', (img.src || '').slice(0, 50));
		  console.error('[PDF->IMG] src length', (img.src || '').length);
		
		  alert('Erro ao carregar a imagem');
		  removerArquivoPreview();
		};
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function converterPdfParaImagem(file) {
    var reader = new FileReader();
    
    arquivoPdfOriginal = file;
    
    reader.onerror = function() {
        tratarErroPdf('Não foi possível ler o arquivo. Tente novamente.');
    };
    
    reader.onload = function(e) {
        var typedArray = new Uint8Array(e.target.result);
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';
        
        pdfjsLib.getDocument({
            data: typedArray,
            verbosity: 0
        }).promise.then(function(pdf) {
            
            var totalPaginas = pdf.numPages;
            
            var scale = 2.0;
            if (totalPaginas > 5) scale = 1.5;
            if (totalPaginas > 10) scale = 1.0;
            if (totalPaginas > 20) scale = 0.75;
            
            console.log('PDF com ' + totalPaginas + ' páginas, usando scale: ' + scale);
            
            var paginasRenderizadas = [];
            var paginasProcessadas = 0;
            
            function renderizarPagina(numPagina) {
                pdf.getPage(numPagina).then(function(page) {
                    var viewport = page.getViewport({ scale: scale });
                    
                    var tempCanvas = document.createElement('canvas');
                    var context = tempCanvas.getContext('2d');
                    tempCanvas.width = viewport.width;
                    tempCanvas.height = viewport.height;
                    
                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    
                    page.render(renderContext).promise.then(function() {
                        paginasRenderizadas[numPagina - 1] = {
                            canvas: tempCanvas,
                            width: viewport.width,
                            height: viewport.height
                        };
                        
                        paginasProcessadas++;
                        
                        if (paginasProcessadas === totalPaginas) {
                            juntarPaginas(paginasRenderizadas);
                        }
                    }).catch(function(error) {
                        console.error('Erro render página ' + numPagina, error);
                        tratarErroPdf('Erro ao renderizar a página ' + numPagina + ' do PDF.');
                    });
                }).catch(function(error) {
                    console.error('Erro acessar página ' + numPagina, error);
                    tratarErroPdf('Erro ao acessar a página ' + numPagina + ' do PDF.');
                });
            }
            
            function juntarPaginas(paginas) {
                var larguraMax = 0;
                var alturaTotal = 0;
                var espacoEntrePaginas = 20;
                
                for (var i = 0; i < paginas.length; i++) {
                    if (paginas[i].width > larguraMax) {
                        larguraMax = paginas[i].width;
                    }
                    alturaTotal += paginas[i].height;
                    if (i < paginas.length - 1) {
                        alturaTotal += espacoEntrePaginas;
                    }
                }
                
                var areaTotal = larguraMax * alturaTotal;
                var LIMITE_PIXELS = 250000000;
                
                console.log('Canvas: ' + larguraMax + ' x ' + alturaTotal + ' = ' + areaTotal + ' pixels');
                
                if (areaTotal > LIMITE_PIXELS) {
                    var fator = Math.sqrt(LIMITE_PIXELS / areaTotal);
                    larguraMax = Math.floor(larguraMax * fator);
                    alturaTotal = Math.floor(alturaTotal * fator);
                    console.log('Canvas reduzido para: ' + larguraMax + ' x ' + alturaTotal);
                    
                    for (var i = 0; i < paginas.length; i++) {
                        paginas[i].width = Math.floor(paginas[i].width * fator);
                        paginas[i].height = Math.floor(paginas[i].height * fator);
                    }
                }
                
                var canvasFinal = document.createElement('canvas');
                var ctxFinal = canvasFinal.getContext('2d');
                canvasFinal.width = larguraMax;
                canvasFinal.height = alturaTotal;
                
                ctxFinal.fillStyle = '#FFFFFF';
                ctxFinal.fillRect(0, 0, canvasFinal.width, canvasFinal.height);
                
                var yAtual = 0;
                for (var i = 0; i < paginas.length; i++) {
                    var xOffset = (larguraMax - paginas[i].width) / 2;

                    ctxFinal.drawImage(paginas[i].canvas, xOffset, yAtual, paginas[i].width, paginas[i].height);
                    yAtual += paginas[i].height + Math.floor(espacoEntrePaginas * (paginas[i].width / paginas[i].canvas.width || 1));
                }
                
                canvasFinal.toBlob(function(blob) {
                    if (!blob) {
                        console.error('toBlob retornou null - canvas muito grande');
                        tratarErroPdf('PDF muito grande. Tente com menos páginas.');
                        return;
                    }
                    
                    var url = URL.createObjectURL(blob);
                    var img = new Image();
                    
                    img.onload = function() {
                        URL.revokeObjectURL(url);
                        imagemOriginal = img;
                        desenharCanvas();
                        $('#previewLoading').hide();
                        $('#btnEnviarRedacao').prop('disabled', false);
                    };
                    
                    img.onerror = function() {
                        console.error('Erro ao carregar imagem do blob');
                        URL.revokeObjectURL(url);
                        tratarErroPdf('Erro ao gerar imagem do PDF.');
                    };
                    
                    img.src = url;
                    
                }, 'image/jpeg', 0.80);
            }
            
            for (var i = 1; i <= totalPaginas; i++) {
                renderizarPagina(i);
            }
            
        }).catch(function(error) {
            console.error('getDocument error', error);
            var mensagem = 'Não foi possível processar este PDF.';
            
            if (error.name === 'PasswordException') {
                mensagem = 'Este PDF está protegido por senha.';
            } else if (error.name === 'InvalidPDFException') {
                mensagem = 'Arquivo PDF inválido ou corrompido.';
            } else if (error.message && error.message.indexOf('encrypted') > -1) {
                mensagem = 'Este PDF está criptografado.';
            }
            
            tratarErroPdf(mensagem);
        });
    };
    
    reader.readAsArrayBuffer(file);
}

function tratarErroPdf(mensagem) {
    $('#previewLoading').hide();
    alert(mensagem + '\n\nSugestão: Tire uma foto ou faça um print da redação e envie como imagem (JPG ou PNG).');
    removerArquivoPreview();
}


function desenharCanvas() {
    if (!imagemOriginal) return;
    
    var canvas = document.getElementById('canvasPreview');
    var ctx = canvas.getContext('2d');
    
    var largura = imagemOriginal.width;
    var altura = imagemOriginal.height;
    
    if (rotacaoAtual === 90 || rotacaoAtual === 270 || rotacaoAtual === -90 || rotacaoAtual === -270) {
        canvas.width = altura;
        canvas.height = largura;
    } else {
        canvas.width = largura;
        canvas.height = altura;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotacaoAtual * Math.PI / 180);
    ctx.drawImage(imagemOriginal, -largura / 2, -altura / 2);
    
    ctx.restore();
}

function rotacionarPreview(graus) {
    rotacaoAtual = (rotacaoAtual + graus) % 360;
    if (rotacaoAtual < 0) rotacaoAtual += 360;
    
    $('#rotacaoAtual').val(rotacaoAtual);
    $('#rotationDegrees').text(rotacaoAtual + '°');
    
    desenharCanvas();
}

function removerArquivoPreview() {
    imagemOriginal = null;
    arquivoPdfOriginal = null;
    rotacaoAtual = 0;
    nomeArquivoOriginal = '';
    
    $('#previewArea').hide();
    $('#uploadArea').show();
    $('#btnEnviarRedacao').prop('disabled', true);
    $('#fileUploadRedacao').val('');
    $('#rotacaoAtual').val(0);
    $('#rotationDegrees').text('0°');
    
    var canvas = document.getElementById('canvasPreview');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function enviarRedacaoComRotacao() {
    if (!imagemOriginal) {
        alert('Selecione um arquivo primeiro');
        return;
    }
    
    var btn = $('#btnEnviarRedacao');
    btn.prop('disabled', true);
    btn.html('<i class="fas fa-spinner fa-spin"></i> Enviando...');
    
    var canvas = document.getElementById('canvasPreview');
    var idUser = $('#fileUploadRedacao').data('id');
    var directory = $('#fileUploadRedacao').data('directory');
    
    function enviarImagem(callback) {
        canvas.toBlob(function(blobImagem) {
            
            var nomeArquivoFinal = converteArquivoInternet(nomeArquivoOriginal);
            nomeArquivoFinal = nomeArquivoFinal.replace(/\.[^.]+$/, '') + '.jpg';
            
            var formData = new FormData();
            formData.append('file', blobImagem, idUser + '.' + nomeArquivoFinal);
            formData.append('diretorio', directory);
            formData.append('delete', false);
            
            $.ajax({
                url: '/portal/RecebeArquivo',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'text',
                success: function(response) {
                    callback(nomeArquivoFinal);
                },
                error: function(xhr, status, error) {
                    alert('Erro ao enviar imagem: ' + error);
                    btn.prop('disabled', false);
                    btn.html('<i class="fas fa-paper-plane"></i> Enviar redação');
                }
            });
            
        }, 'image/jpeg', 0.92);
    }
    
    // Função para enviar o PDF original
    function enviarPdfOriginal(callback) {
        if (!arquivoPdfOriginal) {
            callback();
            return;
        }
        
        var nomePdf = converteArquivoInternet(nomeArquivoOriginal);
        // Garante extensão .pdf
        if (!nomePdf.toLowerCase().endsWith('.pdf')) {
            nomePdf = nomePdf.replace(/\.[^.]+$/, '') + '.pdf';
        }
        
        var formData = new FormData();
        formData.append('file', arquivoPdfOriginal, idUser + '.' + nomePdf);
        formData.append('diretorio', directory);
        formData.append('delete', false);
        
        $.ajax({
            url: '/portal/RecebeArquivo',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'text',
            success: function(response) {
                callback();
            },
            error: function(xhr, status, error) {
                // Se falhar o PDF original, continua mesmo assim
                console.log('Aviso: não foi possível enviar o PDF original');
                callback();
            }
        });
    }
    
    // Função para registrar no banco
    function registrarAvaliacao(nomeArquivoFinal) {
        var idAvaliacaoProposta = null;
        if ($('#idAvaliacaoProposta').length > 0) {
            idAvaliacaoProposta = $('#idAvaliacaoProposta').val();
        }
        
        $.post("/portal/enviarArquivoAvaliacao", {
            arquivo: nomeArquivoFinal,
            idAvaliacaoAluno: $('#idAvaliacaoAluno').val() || '0',
            idAlunoMensalidade: $('#idAlunoMensalidade').val(),
            idAvaliacao: $('#idAvaliacao').val(),
            idTopico: $('#idTopico').val(),
            tipoCurso: $('#tipoCurso').val(),
            idCurso: $('#idCurso').val(),
            idAvaliacaoProposta: idAvaliacaoProposta
        }, function(data) {
            if (data.message.length > 0) {
                alert(data.message);
            }
            
            if (data.status == 0) {
				if ($('#listAvaliacoes').length > 0) {
					document.location.reload(true);
				} else {
					openMedia(null, $('#tokenItem').val());
				}
            } else {
                btn.prop('disabled', false);
                btn.html('<i class="fas fa-paper-plane"></i> Enviar redação');
            }
        }, 'json').fail(function() {
            alert('Erro ao registrar a redação');
            btn.prop('disabled', false);
            btn.html('<i class="fas fa-paper-plane"></i> Enviar redação');
        });
    }
    
    // Executa em sequência: 1) PDF original, 2) Imagem, 3) Registra
    enviarPdfOriginal(function() {
        enviarImagem(function(nomeArquivoFinal) {
            registrarAvaliacao(nomeArquivoFinal);
        });
    });
}

var streamTeste = null;

function testarCamera() {
    $('#btnTestarCamera').prop('disabled', true);
    _setCameraEstado('verificando');

    // Para stream anterior se houver
    if (streamTeste) {
        streamTeste.getTracks().forEach(function(t) { t.stop(); });
        streamTeste = null;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(function(stream) {
            streamTeste = stream;

            // Mostra o preview
            var video = document.getElementById('videoTesteCamera');
            video.srcObject = stream;
            $('#cameraPreviewWrap').slideDown(200);

            _setCameraEstado('gravando');

            // Para o stream após 6 segundos
            setTimeout(function() {
                if (streamTeste) {
                    streamTeste.getTracks().forEach(function(t) { t.stop(); });
                    streamTeste = null;
                }
                video.srcObject = null;
                $('#cameraPreviewWrap').slideUp(200);
                _setCameraEstado('ok');

                // Habilita o botão de iniciar
                $('#btnRealizarAvaliacao').prop('disabled', false);
                $('#btnRealizarAvaliacao').css('opacity', '');

            }, 6000);
        })
        .catch(function(err) {
            var msg = 'Não foi possível acessar a câmera.';

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = 'Permissão negada. Clique no ícone de câmera na barra do navegador, permita o acesso e tente novamente.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = 'Nenhuma câmera encontrada. Conecte uma câmera e tente novamente.';
            } else if (err.name === 'NotReadableError') {
                msg = 'Câmera em uso por outro programa. Feche outros apps e tente novamente.';
            } else {
                msg = 'Erro ao acessar câmera: ' + err.message;
            }

            _setCameraEstado('erro', msg);
        });
}

function _setCameraEstado(estado, msgErro) {
    var icon    = $('#cameraIcon');
    var textH   = $('#cameraText h6');
    var textP   = $('#cameraText p');
    var chip    = $('#cameraStatusChip');
    var block   = $('#cameraBlock');
    var btnTest = $('#btnTestarCamera');

    // Reset visual
    block.css({ 'border-color': '', 'background': '' });
    icon.css({ 'background': '', 'color': '' });

    if (estado === 'verificando') {
        chip.html('<i class="fas fa-spinner fa-spin"></i> Verificando...')
            .css({ background: '#fff3cd', color: '#856404' });
        textH.text('Acessando câmera...');
        textP.text('Aguarde enquanto verificamos sua câmera.');
        btnTest.hide();
    }

    else if (estado === 'gravando') {
        block.css({ 'border-color': '#a3cfbb', 'background': '#f0fff4' });
        icon.css({ 'background': '#d1e7dd', 'color': '#0f5132' });
        chip.html('<i class="fas fa-circle" style="font-size:8px;color:#198754"></i> Ao vivo')
            .css({ background: '#d1e7dd', color: '#0f5132' });
        textH.text('Câmera conectada');
        textP.text('Confira o vídeo abaixo - o teste encerra em alguns segundos.');
        btnTest.hide();
    }

    else if (estado === 'ok') {
        block.css({ 'border-color': '#a3cfbb', 'background': '#f0fff4' });
        icon.css({ 'background': '#d1e7dd', 'color': '#0f5132' });
        icon.html('<i class="fas fa-check-circle"></i>');
        chip.html('<i class="fas fa-check-circle"></i> Verificada')
            .css({ background: '#d1e7dd', color: '#0f5132' });
        textH.text('Câmera verificada com sucesso!');
        textP.text('Tudo certo. Você já pode iniciar a avaliação.');
        btnTest.html('<i class="fas fa-redo mr-1"></i> Retestar')
               .removeClass('btn-warning').addClass('btn-outline-secondary')
               .prop('disabled', false).show();
    }

    else if (estado === 'erro') {
        block.css({ 'border-color': '#f5c2c7', 'background': '#fff8f8' });
        icon.css({ 'background': '#f8d7da', 'color': '#842029' });
        icon.html('<i class="fas fa-video-slash"></i>');
        chip.html('<i class="fas fa-times-circle"></i> Erro')
            .css({ background: '#f8d7da', color: '#842029' });
        textH.text('Câmera não autorizada');
        textP.text(msgErro || 'Não foi possível acessar a câmera.');
        btnTest.html('<i class="fas fa-redo mr-1"></i> Tentar Novamente')
               .removeClass('btn-outline-secondary').addClass('btn-danger')
               .prop('disabled', false).show();
    }
}

var _videoDB       = null; 
var DB_NOME        = 'AvaliacaoVideoDB';
var DB_VERSAO      = 1;
var STORE_CHUNKS   = 'chunks';
var STORE_META     = 'meta';

// Abre (ou cria) o banco
function initVideoDB(callback) {
    if (_videoDB) { 
        callback(true); 
        return; 
    }

    var req = indexedDB.open(DB_NOME, DB_VERSAO);

    req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
            db.createObjectStore(STORE_CHUNKS, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
            db.createObjectStore(STORE_META, { keyPath: 'chave' });
        }
    };

    req.onsuccess = function(e) {
        _videoDB = e.target.result;
        console.log('[IndexedDB] Banco aberto com sucesso');
        callback(true);
    };

    req.onerror = function(e) {
        console.error('[IndexedDB] Erro ao abrir banco:', e.target.error);
        _videoDB = null;
        callback(false); 
    };

    req.onblocked = function() {
        console.warn('[IndexedDB] Banco bloqueado por outra aba');
        callback(false);
    };
}

function salvarChunkVideoDB(blob, callback) {
    if (!_videoDB) {
        if (callback) callback(false);
        return;
    }

    var tx    = _videoDB.transaction(STORE_CHUNKS, 'readwrite');
    var store = tx.objectStore(STORE_CHUNKS);
    var req   = store.add({ data: blob, ts: Date.now() });

    req.onsuccess = function() {
        if (callback) callback(true);
    };

    req.onerror = function(e) {
        console.error('[IndexedDB] Erro ao salvar chunk:', e.target.error);
        if (callback) callback(false);
    };
}

function salvarMetaVideoDB(meta) {
    if (!_videoDB) return;

    var tx    = _videoDB.transaction(STORE_META, 'readwrite');
    var store = tx.objectStore(STORE_META);

    store.put(meta);
}

function recuperarChunksVideoDB(callback) {
    if (!_videoDB) {
        callback([]);
        return;
    }

    var tx    = _videoDB.transaction(STORE_CHUNKS, 'readonly');
    var store = tx.objectStore(STORE_CHUNKS);
    var req   = store.getAll();

    req.onsuccess = function() {
        var chunks = (req.result || []).map(function(r) { return r.data; });
        console.log('[IndexedDB] Chunks recuperados: ' + chunks.length);
        callback(chunks);
    };

    req.onerror = function(e) {
        console.error('[IndexedDB] Erro ao recuperar chunks:', e.target.error);
        callback([]);
    };
}

// Recupera um metadado pelo nome da chave
function recuperarMetaVideoDB(chave, callback) {
    if (!_videoDB) {
        callback(null);
        return;
    }

    var tx    = _videoDB.transaction(STORE_META, 'readonly');
    var store = tx.objectStore(STORE_META);
    var req   = store.get(chave);

    req.onsuccess = function() {
        callback(req.result ? req.result.valor : null);
    };

    req.onerror = function() {
        callback(null);
    };
}

// Limpa tudo só chamar após confirmar que o upload foi para o S3
function limparVideoDB(callback) {
    if (!_videoDB) {
        if (callback) callback();
        return;
    }

    var tx = _videoDB.transaction([STORE_CHUNKS, STORE_META], 'readwrite');
    tx.objectStore(STORE_CHUNKS).clear();
    tx.objectStore(STORE_META).clear();

    tx.oncomplete = function() {
        console.log('[IndexedDB] Banco limpo após upload confirmado');
        if (callback) callback();
    };

    tx.onerror = function(e) {
        console.error('[IndexedDB] Erro ao limpar banco:', e.target.error);
        if (callback) callback();
    };
}

// Verifica se existe gravação salva de tentativa anterior
function temGravacaoSalvaLocal(callback) {
    if (!_videoDB) {
        callback(false);
        return;
    }

    var tx    = _videoDB.transaction(STORE_CHUNKS, 'readonly');
    var store = tx.objectStore(STORE_CHUNKS);
    var req   = store.count();

    req.onsuccess = function() {
        var tem = req.result > 0;
        console.log('[IndexedDB] Tem gravação salva: ' + tem + ' (' + req.result + ' chunks)');
        callback(tem, req.result);
    };

    req.onerror = function() {
        callback(false, 0);
    };
}

var _perfilQualidade = null;

var PERFIS_QUALIDADE = {
    ruim: {
        label:       'Baixa (conexão lenta detectada)',
        cor:         '#856404',
        fundo:       '#fff3cd',
        constraints: {
            video: { width: 320, height: 240, frameRate: { max: 10 } },
            audio: { echoCancellation: true, noiseSuppression: true }
        },
        videoBitrate: 200000,
        audioBitrate: 48000
    },
    media: {
        label:       'Média',
        cor:         '#0c5460',
        fundo:       '#d1ecf1',
        constraints: {
            video: { width: 480, height: 360, frameRate: { max: 15 } },
            audio: { echoCancellation: true, noiseSuppression: true }
        },
        videoBitrate: 500000,
        audioBitrate: 64000
    },
    boa: {
        label:       'Alta',
        cor:         '#0f5132',
        fundo:       '#d1e7dd',
        constraints: {
            video: { width: 640, height: 480, frameRate: { max: 24 } },
            audio: { echoCancellation: true, noiseSuppression: true }
        },
        videoBitrate: 1000000,
        audioBitrate: 96000
    }
};

// Tenta a Network Information API (funciona no Chrome/Android)
function _detectarPorNetworkAPI() {
    var conn = navigator.connection 
            || navigator.mozConnection 
            || navigator.webkitConnection;
    if (!conn) return null;

    var tipo     = conn.effectiveType || '';
    var downlink = conn.downlink      || 0;

    if (tipo === 'slow-2g' || tipo === '2g' || (downlink > 0 && downlink < 1)) return 'ruim';
    if (tipo === '3g'      || (downlink >= 1 && downlink < 4))                  return 'media';
    return 'boa';
}

// Fallback: cronometra uma requisição leve para estimar velocidade
function _detectarPorSpeedTest(callback) {
    var inicio = Date.now();

    $.ajax({
        url:     '/portal/ping-test?t=' + inicio,
        type:    'GET',
        cache:   false,
        timeout: 6000,
        success: function(data, status, xhr) {
            var ms   = Date.now() - inicio;
            var kb   = ((xhr.responseText || '').length / 1024) || 1;
            var kbps = (kb / (ms / 1000)) * 8 * 1024;

            console.log('[Qualidade] Speed test: ' + Math.round(kbps) + ' kbps em ' + ms + 'ms');

            if      (kbps < 800)  callback('ruim');
            else if (kbps < 3000) callback('media');
            else                  callback('boa');
        },
        error: function() {
            console.warn('[Qualidade] Speed test falhou - assumindo média');
            callback('media');
        }
    });
}

// Função principal - chame sempre antes de abrir a câmera
function detectarQualidadeRede(callback) {
    var porAPI = _detectarPorNetworkAPI();

    if (porAPI !== null) {
        console.log('[Qualidade] Detectado via Network API: ' + porAPI);
        _perfilQualidade = porAPI;
        callback(PERFIS_QUALIDADE[porAPI]);
    } else {
        console.log('[Qualidade] Network API indisponível - usando speed test');
        _detectarPorSpeedTest(function(nivel) {
            _perfilQualidade = nivel;
            callback(PERFIS_QUALIDADE[nivel]);
        });
    }
}

// Exibe badge de qualidade para o aluno acima das questões
function _mostrarQualidadeSelecionada(perfil) {
    $('#divQualidadeVideo').remove();

    var html = '<div id="divQualidadeVideo" class="mb-3" '
             + 'style="background:' + perfil.fundo + '; color:' + perfil.cor + '; '
             + 'border-radius:8px; padding:10px 16px; '
             + 'display:flex; align-items:center; gap:10px; font-size:13px;">'
             + '<i class="fas fa-signal"></i>'
             + '<span><strong>Qualidade de gravação:</strong> ' + perfil.label + '</span>'
             + '</div>';

    $('#divQuestoes').before(html);
}

function _enviarVideoComProgresso(blob, signedURL, aoFinalizar) {

    var mbTotal = (blob.size / 1048576).toFixed(1);

    // Mostra o overlay
    $('#overlayEnvioVideo').css('display', 'flex');
    _atualizarProgresso(0, 0, mbTotal);

    // Aviso de internet lenta após 15 segundos sem completar
    var timerInternetLenta = setTimeout(function() {
        $('#avisoInternetLenta').slideDown(200);
    }, 15000);

    var xhr = new XMLHttpRequest();

    // Atualiza a barra conforme o upload avança
    xhr.upload.onprogress = function(e) {
        if (!e.lengthComputable) return;
        var pct     = Math.round((e.loaded / e.total) * 100);
        var mbEnv   = (e.loaded  / 1048576).toFixed(1);
        _atualizarProgresso(pct, mbEnv, mbTotal);
    };

    // Upload concluído com sucesso
    xhr.onload = function() {
        clearTimeout(timerInternetLenta);

        if (xhr.status === 200) {
            _atualizarProgresso(100, mbTotal, mbTotal);
            $('#textoProgressoUpload').text('Vídeo enviado! Salvando suas respostas...');

            // Apaga o IndexedDB só após confirmar que subiu
            limparVideoDB(function() {
			    console.log('[Upload] IndexedDB limpo após upload confirmado');
			    if (typeof aoFinalizar === 'function') {
			        aoFinalizar();
			    } else {
			        salvarAvaliacao();
			    }
			});

        } else {
            clearTimeout(timerInternetLenta);
            $('#overlayEnvioVideo').hide();
            alert('Erro no envio do vídeo (HTTP ' + xhr.status + '). '
                + 'Sua prova foi salva localmente. Tente novamente.');
            $('#btnAvaliacaoSalvar').prop('disabled', false)
                                    .text('Tentar Enviar Novamente');
        }
    };

    // Erro de rede
    xhr.onerror = function() {
        clearTimeout(timerInternetLenta);
        $('#overlayEnvioVideo').hide();
        alert('Sem conexão durante o envio. Sua gravação está salva no seu computador. '
            + 'Recarregue a página para tentar reenviar.');
        $('#btnAvaliacaoSalvar').prop('disabled', false)
                                .text('Tentar Enviar Novamente');
    };

    xhr.open('PUT', signedURL, true);
    xhr.setRequestHeader('Content-Type', 'video/webm');
    xhr.send(blob);
}

function _atualizarProgresso(pct, mbEnviado, mbTotal) {
    $('#barraProgressoUpload').css('width', pct + '%');
    $('#pctProgressoUpload').text(pct + '%');

    if (mbEnviado > 0) {
        $('#tamanhoProgressoUpload').text(mbEnviado + ' MB / ' + mbTotal + ' MB');
    } else {
        $('#tamanhoProgressoUpload').text('Total: ' + mbTotal + ' MB');
    }

    if (pct === 0) {
        $('#textoProgressoUpload').text('Preparando envio...');
    } else if (pct < 30) {
        $('#textoProgressoUpload').text('Enviando... não feche essa janela.');
    } else if (pct < 70) {
        $('#textoProgressoUpload').text('Enviando... já passou da metade!');
    } else if (pct < 100) {
        $('#textoProgressoUpload').text('Quase lá...');
    }
}

function _mostrarBannerRecuperacao(qtdChunks, urlSalva) {

    // Remove banner anterior se existir
    $('#bannerRecuperacaoVideo').remove();

    var html = '<div id="bannerRecuperacaoVideo" class="mb-3"'
             + ' style="background:#fff3cd; color:#856404; border:1.5px solid #ffc107;'
             + ' border-radius:10px; padding:16px 20px;">'

             + '<div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">'
             + '  <i class="fas fa-exclamation-triangle" style="font-size:22px; flex-shrink:0;"></i>'
             + '  <div>'
             + '    <strong style="font-size:14px;">Encontramos uma gravação não enviada</strong><br>'
             + '    <span style="font-size:12px;">Uma gravação anterior desta prova ficou salva no seu computador ('
             +       qtdChunks + ' partes). Isso pode ter ocorrido por queda de internet.</span>'
             + '  </div>'
             + '</div>'

             + '<div style="display:flex; gap:10px; flex-wrap:wrap;">'
             + '  <button type="button" class="btn btn-warning btn-sm font-weight-bold px-3"'
             + '          onclick="_reenviarGravacaoLocal()">'
             + '    <i class="fas fa-cloud-upload-alt mr-1"></i> Reenviar gravação salva'
             + '  </button>'
             + '</div>'

             + '</div>';

    // Insere antes das questões
	// Na tela de questões insere antes das questões
	// Na tela anterior insere dentro do task-information-content
	if ($('#divQuestoes').length > 0) {
	    $('#divQuestoes').before(html);
	} else {
	    // Na tela anterior, insere antes do footer (botão de realizar)
	    $('.task-information-footer').before(html);
	}
    // Guarda a URL para uso no reenvio
    $('#bannerRecuperacaoVideo').data('urlSalva', urlSalva);
}

function _reenviarGravacaoLocal() {
    var urlSalva = $('#bannerRecuperacaoVideo').data('urlSalva');

    $('#bannerRecuperacaoVideo').remove();

    recuperarChunksVideoDB(function(chunks) {
        if (!chunks || chunks.length === 0) {
            alert('Não foi possível recuperar a gravação. Os dados podem ter sido apagados pelo navegador.');
            return;
        }

        var blob = new Blob(chunks, { type: 'video/webm' });
        console.log('[Recuperação] Reenviando ' + chunks.length + ' chunks - ' 
                    + (blob.size / 1048576).toFixed(1) + ' MB');

        // Passa callback próprio - respostas já foram salvas anteriormente
        _enviarVideoComProgresso(blob, urlSalva, function() {
            $('#overlayEnvioVideo').hide();
            $('#textoProgressoUpload').text('');
            alert('Gravação enviada com sucesso!');
        });
    });
}

function _descartarGravacaoLocal() {
    if (confirm('Tem certeza que deseja descartar a gravação salva? Esta ação não pode ser desfeita.')) {
        limparVideoDB(function() {
            $('#bannerRecuperacaoVideo').slideUp(200, function() {
                $(this).remove();
            });
            console.log('[Recuperação] Gravação descartada pelo aluno');
        });
    }
}