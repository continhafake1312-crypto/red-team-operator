function loadContent() {
	$('#modalFooter1').show();
	$('#modalDialog1').width('100%');
	$('#modalDialog1').height('auto');
	$('#btnMaterial').hide();
    $('#btnChat').hide();
    $('#btnDownloadTrilha').hide();
    $('#divClassificacao').hide();
    $('#divClassificacao').attr("style", "display: none !important");
    $('#btnFavoritos').hide();
    $('#btnAnotacoes').hide();
    $('#btnAnotacoes').attr("style", "display: none !important");
    $('#btnDuvida').hide();
    $('#modalDialog1').css('max-width','100%');
    $('.modal-content').css('background-color','#FFFFFF');
    $('#modal1').css('overflow','hidden');
	if ($('#btnFechar').length > 0) $('#btnFechar').prop('disabled',false);
	if ($('#btnClose1').length > 0) $('#btnClose1').prop('disabled',false);
	if ($('#btnAvancar').length > 0) $('#btnAvancar').prop('disabled',false);
	if ($('#btnRetroceder').length > 0) $('#btnRetroceder').prop('disabled',false);

	if ($('#tituloNomeAula').length > 0) {
		$('#tituloNomeAula').tooltip('dispose');
		$('#tituloNomeAula').html($('#nomeAula').val()).attr('title', $('#nomeAula').val()).tooltip();
	}

    if ($('#chaveAnterior').val() == '') {
        $('#btnRetroceder').hide();
    }  else {
        $('#btnRetroceder').show();
    }
    if ($('#chaveProximo').val() == '') {
        $('#btnAvancar').hide();
    }  else {
        $('#btnAvancar').show();
    }

	$('#modalBodyMedia').css('overflowY', '');
    var heightVideo = $(window).height() - 96;
	if (heightVideo < 100) {
		if ($('#modalBodyMedia').height() < 100) {
			if ($('#modalContent').height() > 100) {
				heightVideo = $('#modalContent').height();
			}
		} else {
			heightVideo = $('#modalBodyMedia').height();
		}
    }
    $('#iframeScorm').height(heightVideo + 25);
    $('#iframeLti').height(heightVideo + 25);
    $('#modalBodyMedia').height(heightVideo);
    $('#modalBodyMedia').css('overflow','hidden');
    if ($('#tipoContent').val() == 'text/html') $('#modalBodyMedia').css('overflow','auto');
	
	if ($('#tipoContent').val() == 'application/conted') {
     	TimerConteudo.init();
	}
}



/* ========================================
   TIMER DE CONTEÚDO COM PERSISTÊNCIA LOCAL
   ======================================== */

var TimerConteudo = (function() {
    
    var intervalo = null;
    var segundosRestantes = 0;
    var chaveStorage = '';
    var token = '';
    var pausado = false;
    var concluido = false;
    
    // Inicializa o timer// Inicializa o timer
	function init() {
	    var tempoMinutos = parseInt($('#tempoMinutos').val()) || 0;
	    var idTopico = $('#idTopicoVideoAbrir4').val();
	    token = 'item-' + $('#token').val()  + '-' + $('#idTopicoVideoAbrir4').val();
	    
	    // Se não tem idTopico, não faz nada
	    if (!idTopico) {
	        return;
	    }
	    
	    chaveStorage = 'timer_' + idTopico;
	    
	    // Verifica se já foi concluído
	    if (localStorage.getItem(chaveStorage + '_concluido') === 'true') {
	        concluido = true;
	        criarElementoTimer();
	        mostrarConcluido();
	        return;
	    }
	    
	    // Recupera tempo salvo ou usa o tempo inicial
	    var tempoSalvo = localStorage.getItem(chaveStorage);
	    if (tempoSalvo !== null) {
	        segundosRestantes = parseInt(tempoSalvo);
	    } else {
	        segundosRestantes = tempoMinutos * 60;
	    }
	    
	    // Cria o elemento visual
	    criarElementoTimer();
	    
	    // Se tempo já é zero, mostra botão direto
	    if (segundosRestantes <= 0) {
	        timerZerou();
	        return;
	    }
	    
	    // Inicia o timer
	    iniciarContagem();
	    
	    // Listeners para visibilidade da página
	    configurarVisibilidade();
	}
    
    // Cria o elemento HTML do timer
    function criarElementoTimer() {
        var html = '<div id="timerFlutuante" class="timer-flutuante">' +
                       '<div class="timer-label">Tempo restante</div>' +
                       '<div class="timer-display" id="timerDisplay">00:00</div>' +
                       '<div class="timer-pausado" id="timerPausado" style="display:none;">Pausado</div>' +
                       '<button class="btn-concluir" id="btnConcluirTimer" style="display:none;">Marcar como Concluído</button>' +
                   '</div>';
        
        $('body').append(html);
        
        // Evento do botão concluir
        $('#btnConcluirTimer').on('click', function() {
            marcarComoConcluido();
        });
        
        atualizarDisplay();
    }
    
    // Inicia a contagem regressiva
    function iniciarContagem() {
        if (intervalo) clearInterval(intervalo);
        
        intervalo = setInterval(function() {
            if (!pausado && segundosRestantes > 0) {
                segundosRestantes--;
                salvarProgresso();
                atualizarDisplay();
                
                // Alerta quando falta 1 minuto
                if (segundosRestantes === 60) {
                    $('#timerFlutuante').addClass('timer-alerta');
                }
                
                // Quando zerar
                if (segundosRestantes <= 0) {
                    timerZerou();
                }
            }
        }, 1000);
    }
    
    // Atualiza o display do timer
    function atualizarDisplay() {
        var minutos = Math.floor(segundosRestantes / 60);
        var segundos = segundosRestantes % 60;
        var display = padZero(minutos) + ':' + padZero(segundos);
        $('#timerDisplay').text(display);
    }
    
    // Adiciona zero à esquerda
    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }
    
    // Salva progresso no localStorage
    function salvarProgresso() {
        localStorage.setItem(chaveStorage, segundosRestantes);
    }
    
    // Quando o timer zera
    function timerZerou() {
        clearInterval(intervalo);
        $('#timerFlutuante').removeClass('timer-alerta');
        $('#timerDisplay').text('00:00');
        $('.timer-label').text('Tempo concluído!');
        $('#btnConcluirTimer').show();
    }
    
    // Marca como concluído no servidor
    function marcarComoConcluido() {
        var btn = $('#btnConcluirTimer');
        btn.prop('disabled', true).text('Enviando...');
        
        $.ajax({
            url: '/portal/sendMultimediaLogSimples',
            type: 'POST',
            data: { token: token },
            dataType: 'json',
            success: function(response) {
                if (response && response.status === 0) {
                    // Sucesso
                    localStorage.setItem(chaveStorage + '_concluido', 'true');
                    localStorage.removeItem(chaveStorage);
                    mostrarConcluido();
                } else {
                    // Erro do servidor
                    btn.prop('disabled', false).text('Tentar Novamente');
                    alert('Erro ao marcar como concluído. Tente novamente.');
                }
            },
            error: function(xhr, status, error) {
                btn.prop('disabled', false).text('Tentar Novamente');
                alert('Erro de conexão. Tente novamente.');
                console.error('Erro:', error);
            }
        });
    }
    
    // Mostra estado concluído
    function mostrarConcluido() {
        $('#timerFlutuante').addClass('timer-concluido');
        $('.timer-label').text('Concluído!');
        $('#timerDisplay').text('OK');
        $('#btnConcluirTimer').hide();
        $('#timerPausado').hide();
        
        // Remove após 5 segundos
        setTimeout(function() {
            $('#timerFlutuante').fadeOut(500, function() {
                $(this).remove();
            });
        }, 5000);
    }
    
    // Configura listeners de visibilidade
    function configurarVisibilidade() {
        // Quando muda a visibilidade da aba
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                pausarTimer();
            } else {
                retomarTimer();
            }
        });
        
        // Quando a janela perde/ganha foco
        $(window).on('blur', function() {
            pausarTimer();
        });
        
        $(window).on('focus', function() {
            retomarTimer();
        });
    }
    
    // Pausa o timer
    function pausarTimer() {
        if (!concluido && segundosRestantes > 0) {
            pausado = true;
            salvarProgresso();
            $('#timerPausado').show();
            $('#timerFlutuante').css('opacity', '0.7');
        }
    }
    
    // Retoma o timer
    function retomarTimer() {
        if (!concluido && segundosRestantes > 0) {
            pausado = false;
            $('#timerPausado').hide();
            $('#timerFlutuante').css('opacity', '1');
        }
    }
    
    // Destruir timer (para quando fechar o modal)
    function destruir() {
        if (intervalo) clearInterval(intervalo);
        $('#timerFlutuante').remove();
    }
    
    // API pública
    return {
        init: init,
        destruir: destruir,
        pausar: pausarTimer,
        retomar: retomarTimer
    };
    
})();


window.marcarConteudoConcluido = function(callbackSucesso, callbackErro) {
    var tokenBase = $('#token').val();
    var idTopico = $('#idTopicoVideoAbrir4').val();

    if (!tokenBase || !idTopico) {
        console.error('Não foi possível marcar como concluído: token ou idTopico não encontrado.');

        if (typeof callbackErro === 'function') {
            callbackErro({
                mensagem: 'Token ou idTopico não encontrado.'
            });
        }

        return;
    }

    var token = 'item-' + tokenBase + '-' + idTopico;

    $.ajax({
        url: '/portal/sendMultimediaLogSimples',
        type: 'POST',
        data: {
            token: token
        },
        dataType: 'json',
        success: function(response) {
            if (response && response.status === 0) {
                console.log('Conteúdo marcado como concluído com sucesso.');

                if (typeof callbackSucesso === 'function') {
                    callbackSucesso(response);
                }
            } else {
                console.error('Erro ao marcar conteúdo como concluído.', response);

                if (typeof callbackErro === 'function') {
                    callbackErro(response);
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('Erro de conexão ao marcar conteúdo como concluído:', error);

            if (typeof callbackErro === 'function') {
                callbackErro({
                    xhr: xhr,
                    status: status,
                    error: error
                });
            }
        }
    });
};