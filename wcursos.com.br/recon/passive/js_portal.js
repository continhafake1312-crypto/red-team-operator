$(function() {
	
	$("body").tooltip({ selector: '[data-toggle=tooltip]' });

	$(this).bind("contextmenu", function(e) {
		//e.preventDefault();
	});

	$("select").each(function(index) {
		if ($(this).data('value') != '') {
			$(this).val($(this).data('value'));
			$(this).change();
		}
	});

	$('[data-method="last12months"]').each(function(index) {
		loadTeacherReport($(this))
	});

	$("textarea").each(function(index) {
		if ($("#" + $(this).attr('id') + '-length').length > 0) {
			$(this).restrictLength($("#" + $(this).attr('id') + '-length'));
		}
	});

	$('[data-load="video"]').each(function(index) {
		openMedia(event, $(this).data('id'), '', 'V');
	});

	$('#telefoneCelular').mask('(99) 99999-9999', { placeholder: "(99) 99999-9999" });
	$('#cep').mask('99999999', { placeholder: "99999999" });
	if ($("#idEstado").length > 0) loadEstado($('#idEstado').attr("data-info"), $('#idCidade').attr("data-info"), $('#idBairro').attr("data-info"));
	$('#cep').focus(function() { $('#cep').attr('data-info', $('#cep').val()); });
	$('#telefoneCasa').mask('(99) 9999-9999', { placeholder: "(99) 9999-9999" });
	if ($("#idTopicoVideoAbrir").length > 0 && $("#idTopicoVideoAbrir").val().length > 0) {
		openMedia(event, 'item-' + $("#token").val() + '-' + $("#idTopicoVideoAbrir").val(), '', 'V');
	}

	if ($("[data-date]").length > 0) {
		$("[data-date]").mask('00/00/0000');
		$("[data-date]").datepicker({
			autoclose: true,
			todayHighlight: true,
			todayBtn: true,
			format: 'dd/mm/yyyy'
		});
	}

	$('[data-method="gerarPDF"]').each(function(index) {
		gerarPDF($(this).data('div'), $(this).data('path'), 0, 0, carregarCorrecao);
	});
	$('.tab-pedidos').first().addClass("active");
	$('.div-pedidos').first().addClass("active show");

	if ($(".mceEditor").length > 0 || $('.mceEditorComentario').length > 0) {

		const toolbar = 'forecolor backcolor bold italic underline | alignleft aligncenter alignright alignjustify | removeformat | subscript superscript | charmap emoticons';

		tinymce.init({
			editor_selector: 'mceEditor',
			mode: "specific_textareas",
			height: 350,
			menubar: false,
			browser_spellcheck: true,
			language: 'pt_BR',
			branding: false,
			plugins: [
				'advlist autolink lists link image charmap print preview anchor',
				'searchreplace visualblocks fullscreen',
				'insertdatetime media wordcount textcolor emoticons'
			],
			toolbar: toolbar
		});


		tinymce.init({
			editor_selector: 'mceEditorComentario',
			mode: "specific_textareas",
			height: 300,
			browser_spellcheck: true,
			menubar: false,
			language: 'pt_BR',
			branding: false,
			plugins: [
				'advlist autolink lists link image charmap print preview anchor',
				'searchreplace visualblocks fullscreen',
				'insertdatetime media wordcount textcolor emoticons'
			],
			toolbar: toolbar
		});
	}


	if ($("#divDocument textarea").length > 0) {
		setTimeout(carregarCorrecao(), 2000);
	}

	if ($("#listaTopicos").length > 0) {
		if ($('#listaTopicos li').length == 1) {
			$('#listaTopicos li').click();
		}
	}

	if ($("#token").length > 0) {
		sincronizarVideo(false);
		setInterval(temporizadorSendLog, 2000);
	}

	window.onbeforeunload = confirmExit;
	function confirmExit() {
		if (typeof $('#token').val() !== "undefined") {
			sincronizarVideo(true);
		}
	}

	if ($('#graficoTema').length > 0) {
		var ctx1 = document.getElementById("graficoTema");
		var myChart1 = new Chart(ctx1, {
			type: 'bar',
			data: {
				labels: labelTema,
				datasets: [{
					label: 'Questão por Assunto',
					data: listaValor1,
					backgroundColor: 'rgb(210, 214, 222)',
					borderColor: 'rgb(210, 214, 222)',
					fill: true,
					borderWidth: 1
				},
				{
					label: 'Seus Acertos por Assunto',
					data: listaValor2,
					backgroundColor: 'rgba(60,141,188,0.9)',
					borderColor: 'rgba(60,141,188,0.9)',
					fill: true,
					borderWidth: 1
				}
				],
			},
			options: {
				responsive: true,
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				animationEnabled: true,
				animationDuration: 2000,
				responsiveAnimationDuration: 2000,
				animation: {
					duration: 2000,
					easing: 'easeOutBack'
				}
			}
		});

		var ctx2 = document.getElementById("graficoRange");
		var myChart2 = new Chart(ctx2, {
			data: {
				datasets: [{
					type: 'line',
					label: 'Line Dataset',
					data: listaRangePercentual
				}, {
					type: 'bar',
					label: 'Bar Dataset',
					data: listaRangeValor,
				}],
				labels: listaRangeTitulo
			},
			options: {
				responsive: true,
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				animationEnabled: true,
				animationDuration: 2000,
				responsiveAnimationDuration: 2000,
				animation: {
					duration: 2000,
					easing: 'easeOutBack'
				}
			}
		});

		var ctx3 = document.getElementById("graficoHistorico");
		var myChart3 = new Chart(ctx3, {
			type: 'line',
			data: {
				labels: listaHistoricoTitulo,
				datasets: [
					{
						label: 'Pontuação',
						data: listaHistoricoValor,
						borderColor: 'rgba(60,141,188,0.9)',
						borderWidth: 1
					}
				],
			},
			options: {
				responsive: true,
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				animationEnabled: true,
				animationDuration: 2000,
				responsiveAnimationDuration: 2000,
				animation: {
					duration: 2000,
					easing: 'easeOutBack'
				}
			}
		});

		var ctx4 = document.getElementById("graficoTemaGeral");
		var myChart1 = new Chart(ctx4, {
			type: 'bar',
			data: {
				labels: labelTemaGeral,
				datasets: [{
					label: 'Questão por Assunto',
					data: listaValorGeral1,
					backgroundColor: 'rgb(210, 214, 222)',
					borderColor: 'rgb(210, 214, 222)',
					fill: true,
					borderWidth: 1
				},
				{
					label: 'Seus Acertos por Assunto',
					data: listaValorGeral2,
					backgroundColor: 'rgba(60,141,188,0.9)',
					borderColor: 'rgba(60,141,188,0.9)',
					fill: true,
					borderWidth: 1
				}
				],
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				plugins: {
					legend: {
						position: 'right',
					},
					title: {
						display: true,
						text: 'Todas as avaliações'
					}
				},
				animationEnabled: true,
				animationDuration: 2000,
				responsiveAnimationDuration: 2000,
				animation: {
					duration: 2000,
					easing: 'easeOutBack'
				}
			}
		});

		var ctx4 = document.getElementById("graficoDisciplinaGeral");
		var myChart1 = new Chart(ctx4, {
			type: 'bar',
			data: {
				labels: labelDisciplinaGeral,
				datasets: [{
					label: 'Questão por Assunto',
					data: listaValorDisciplinaGeral1,
					backgroundColor: 'rgb(210, 214, 222)',
					borderColor: 'rgb(210, 214, 222)',
					fill: true,
					borderWidth: 1
				},
				{
					label: 'Seus Acertos por Assunto',
					data: listaValorDisciplinaGeral2,
					backgroundColor: 'rgba(60,141,188,0.9)',
					borderColor: 'rgba(60,141,188,0.9)',
					fill: true,
					borderWidth: 1
				}
				],
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				plugins: {
					legend: {
						position: 'right',
					},
					title: {
						display: true,
						text: 'Todas as avaliações'
					}
				},
				animationEnabled: true,
				animationDuration: 2000,
				responsiveAnimationDuration: 2000,
				animation: {
					duration: 2000,
					easing: 'easeOutBack'
				}
			}
		});

	}

	if ($(".test-comentado-video1").length > 0) {
		openMedia(null, $(".test-comentado-video1").attr('id'), '', 'V');
	}

	//FUNCOES DARKMODE
	let isDarkTheme;
	let shouldUpdateServer = false;
	
	if ($("body").hasClass("theme-dark")) {
		isDarkTheme = true;
	} else if ($("body").hasClass("theme-light")) {
		isDarkTheme = false;
	} else {
		const defaultTheme = $("#sidebar").data("default-theme");
		isDarkTheme = defaultTheme === "dark";
		shouldUpdateServer = true;
	}
	
	setTheme(isDarkTheme, shouldUpdateServer ? 1 : 0);

	if (document.getElementById("toggle-theme") != null) {
		document.getElementById("toggle-theme").addEventListener("click", function() {
			const isDarkTheme = localStorage.getItem("darkTheme") === "true";
			const newTheme = !isDarkTheme;
			localStorage.setItem("darkTheme", newTheme);
			setTheme(newTheme, 1);
		});
	}
	
	$('.slick-responsive-auto.single').slick({
        lazyLoad: 'ondemand',
        mobileFirst: false,
        dots: true,
        arrows: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        autoplay: true,
        autoplaySpeed: 3500,
    });    

	$('.slick-responsive-auto.double').slick({
	    lazyLoad: 'ondemand',
	    mobileFirst: false,
	    dots: true,
	    arrows: true,
	    slidesToShow: 2,
	    slidesToScroll: 1,
	    infinite: false,
	    autoplay: true,
	    autoplaySpeed: 3500,
	    responsive: [
	    {
	        breakpoint: 1000,
	        settings: {
	            slidesToShow: 2,
	        }
	    },
	    {
	        breakpoint: 600,
	        settings: {
	            slidesToShow: 2,
	        }
	    }]
	});

	$('.slick-responsive-auto.triple').slick({
	    lazyLoad: 'ondemand',
	    mobileFirst: false,
	    dots: true,
	    arrows: true,
	    slidesToShow: 3,
	    slidesToScroll: 1,
	    infinite: false,
	    autoplay: true,
	    autoplaySpeed: 3500,
	    responsive: [
	    {
	        breakpoint: 1000,
	        settings: {
	            slidesToShow: 2,
	        }
	    },
	    {
	        breakpoint: 600,
	        settings: {
	            slidesToShow: 1,
	        }
	    }]
	});

    $('.slick-responsive-auto.quadruple').slick({
	    lazyLoad: 'ondemand',
	    mobileFirst: false,
	    dots: true,
	    arrows: true,
	    slidesToShow: 4,
	    slidesToScroll: 1,
	    infinite: false,
	    autoplay: false,
	    autoplaySpeed: 3500,
	    responsive: [
	    {
	        breakpoint: 1000,
	        settings: {
	            slidesToShow: 3,
	        }
	    },
	    {
	        breakpoint: 600,
	        settings: {
	            slidesToShow: 2,
	        }
	    },
	    {
	        breakpoint: 400,
	        settings: {
	            slidesToShow: 1,
	        }
	    }]
	});

	$('.slick-responsive-auto.quintuple').slick({
	    lazyLoad: 'ondemand',
	    mobileFirst: false,
	    dots: true,
	    arrows: true,
	    slidesToShow: 5,
	    slidesToScroll: 1,
	    infinite: false,
	    autoplay: false,
	    autoplaySpeed: 3500,
	    responsive: [
	    {
	        breakpoint: 1000,
	        settings: {
	            slidesToShow: 4,
	        }
	    },
	    {
	        breakpoint: 600,
	        settings: {
	            slidesToShow: 2,
	        }
	    }]
	});

	if ($("#btnCopyLinkPix").length > 0) {
		$('#btnCopyLinkPix').click(function() {
			var copyText = document.getElementById("copyLinkPix");
			copyText.select();
			document.execCommand("copy");
		});
	}
	
    $('#searchTrigger').on('click', function() {
        $('#searchOverlay').addClass('show');
        $('#searchOverlay input').focus();
    });
    $('#closeSearch').on('click', function() {
        $('#searchOverlay').removeClass('show');
    });
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('#searchOverlay').removeClass('show');
        }
    });
    $('#searchOverlay').on('click', function(e) {
        if (e.target === this) {
            $(this).removeClass('show');
        }
    });
});

function setTheme(isDarkTheme, server) {
	if (isDarkTheme == true) {
		if (server == 1) {
			setThemeServer("theme-dark");
		}
		if ($('#toggle-theme .light').length > 0) {
			$('#toggle-theme .light').hide();
			$('#toggle-theme .dark').show();
		} else {
			$('#toggle-theme i').attr('class', 'far fa-sun-bright');
		}
		$("body").removeClass("theme-light").addClass("theme-dark");
	} else {
		if (server == 1) {
			setThemeServer("theme-light");
		}
		if ($('#toggle-theme .dark').length > 0) {
			$('#toggle-theme .dark').hide();
			$('#toggle-theme .light').show();
		} else {
			$('#toggle-theme i').attr('class', 'far fa-moon');
		}
		$("body").removeClass("theme-dark").addClass("theme-light");
	}		
}

function setThemeServer(theme) {
    $.ajax({
        url: "/portal/setTheme",
        type: "POST",
        data: { theme: theme },
        success: function (response) {
        },
        error: function (xhr, status, error) {
        }
    });
}


function temporizadorSendLog() {
	sincronizarVideo(false);
}

function sleep(delay) {
	var start = new Date().getTime();
	while (new Date().getTime() < start + delay);
}

function carregarCorrecao() {
	
	$('.fas.fa-circle.flag-comentario').each(function() {
    	$(this).remove();
	});
	$('.linhaCorrecao').each(function() {
    	$(this).remove();
	});
	
	if ($(".flag-correcao").length > 0 && $("#idAvaliacaoAluno").val() != null && $("#idAvaliacaoAluno").val() > 0) {
		$.getJSON("/portal/getFlagComentario", { format: "json", id: $("#idAvaliacaoAluno").val() }).done(function(data) {
			if (data != null) {
				for (var i = 0; i < data.length; i++) {
					if (data[i].tipo == 1) {
						var varLargura = getWidth() / data[i].largura;
						var varAltura = getHeight() / data[i].altura;
						var esquerda = (data[i].esquerda * varLargura);
						var topo = (data[i].topo * varAltura);
						criarIcone(data[i].id, topo, esquerda, data[i].largura, data[i].altura, data[i].comentario, '#' + data[i].cor);
					} else if (data[i].tipo == 2) {
						var varLargura = getWidth() / data[i].largura;
						var varAltura = getHeight() / data[i].altura;
						var esquerda = (data[i].esquerda * varLargura);
						var topo = (data[i].topo * varAltura);
						var esquerda2 = (data[i].esquerda2 * varLargura);
						var topo2 = (data[i].topo2 * varAltura);
						criarLinha(data[i].id, esquerda, topo, esquerda2, topo2, '#' + data[i].cor);
						criarEventoApagarLinha(data[i].id);			
					}

				}
				if ($("#divDocument img").length > 0) {
					$("#divDocument img").css({ float: 'right' });
					//$("#divDocument img").css({position: 'absolute',top: '0px',left: '0px'});
				} else if ($("#divDocument canvas").length > 0) {
					$("#divDocument canvas").css({ float: 'right' });
				}
			}
		});
	}
}

function toggleFlagComentario() {
	const pontosVermelhos = document.querySelectorAll('.flag-comentario');
	pontosVermelhos.forEach(ponto => {
		if (ponto.style.display === "") {
			ponto.style.display = "none";
		} else {
			ponto.style.display = "";
		}
	});
}

function editarTextoAvaliacao() {
	toggleFlagComentario();

	const textArea = document.getElementById('textoAvaliacao');
	textArea.removeAttribute('readonly');

	const botaoEditar = document.getElementById('btnEditarAvaliacao');
	botaoEditar.disabled = true;
}

function openTopic(event, objectMain, token, local, isComplement) {
	if ($('#' + token + local).length == 0) {
		var contentHtml = $(objectMain).html();
		$(objectMain).html($(objectMain).html() + '<span class="badge badge-warning badge-media">' + label01 + '...</span>');
		$.getJSON("/portal/getTopico", { format: "json", token: token }).done(function(data) {
			contentHtml = contentHtml + '<ul class="list-unstyled" id="' + token + local + '">';
			if (data.listTopics != null) {
				for (var i = 0; i < data.listTopics.length; i++) {
					var comentario = '';
					if (data.listTopics[i] != null && data.listTopics[i].comentario != null && data.listTopics[i].comentario.length > 0) {
						comentario = '<span class="badge badge-success badge-media badge-media-' + data.tipo + '">' + data.listTopics[i].comentario + '</span>';
					}
					if (isComplement == false) comentario = '';
					contentHtml += '<li onclick="openTopic(event, this, \'' + data.token + '-' + data.listTopics[i].token + '\', \'' + local + '\',' + isComplement + ')"><div class="texto">' + data.listTopics[i].nome + comentario + '</div></li>';
				}
			}
			if (data.listTopicsMedia != null) {
				for (var i = 0; i < data.listTopicsMedia.length; i++) {
					var styleIcon = '';
					var complement = '';
					var corIcon = 'text-dark'
					var corBadge = 'badge-dark'
					if (data.listTopicsMedia[i].vistoFinal == 'S') {
						corIcon = 'text-success';
						corBadge = 'badge-success';
					} else if (data.listTopicsMedia[i].visto == 'S') {
						corIcon = 'text-checked';
						corBadge = 'badge-checked';
					}

					if (data.listTopicsMedia[i].tipoMidia == 'V') {
						if (data.listTopicsMedia[i].videoTO != null && data.listTopicsMedia[i].videoTO.tipo != null && data.listTopicsMedia[i].videoTO.tipo == 'D') {
							styleIcon = 'fas fa-volume-up pr-2 media-class';
						} else {
							styleIcon = 'fas fa-video pr-2 media-class';
						}
						complement = '<span class="media-complement">(' + data.listTopicsMedia[i].videoTO.duracaoFormatadoExtenso + ')</span><span class="badge ' + corBadge + ' badge-media" id="badgeMedia' + data.listTopicsMedia[i].token + '">' + getMaxVistoFormatado(data.listTopicsMedia[i].maxVistoFormatado, data.listTopicsMedia[i].maxVisto) + '</span><i class="fas fa-user-clock media-video-complement" onmouseout="closeVideoTime(this)" onmouseleave="closeVideoTime(this)"  onmouseenter="getVideoTime(this)" id="iconClock-' + data.listTopicsMedia[i].videoTO.tipo + '-' + data.listTopicsMedia[i].videoTO.param + '"></i>';
						if ($('#temFlagVisto').val() == 'S') complement += '<i class="fas fa-user-check media-video-complement mr-2" data-video="' + data.listTopicsMedia[i].videoTO.param + '" data-visto="' + data.listTopicsMedia[i].marcadoVisto + '" onclick="marcarVistoEvent(event,\'' + data.listTopicsMedia[i].token + '\')" id="iconCheck-' + data.listTopicsMedia[i].token + '"></i>';
					} else if (data.listTopicsMedia[i].tipoMidia == 'D') {
						styleIcon = 'far fa-file pr-2 media-class';
					} else if (data.listTopicsMedia[i].tipoMidia == 'U') {
						styleIcon = 'fas fa-link pr-2 media-class';
					} else if (data.listTopicsMedia[i].tipoMidia == 'A') {
						styleIcon = 'fas fa-check-circle pr-2 media-class';
						if (data.listTopicsMedia[i].avaliacaoTO.quantidadePergunta > 0) {
							complement = '<span class="badge ' + corBadge + ' badge-media">' + data.listTopicsMedia[i].avaliacaoTO.quantidadePergunta + ' ' + label31 + '</span>';
						} else {
							complement = '';
						}
					} else if (data.listTopicsMedia[i].tipoMidia == 'C') {
						styleIcon = 'fas fa-file-alt pr-2 media-class';
					} else if (data.listTopicsMedia[i].tipoMidia == 'H') {
						styleIcon = 'fas fa-comment-alt pr-2 media-class';
					} else if (data.listTopicsMedia[i].tipoMidia == 'F') {
						styleIcon = 'fas fa-comments pr-2 media-class';
					} else if (data.listTopicsMedia[i].tipoMidia == 'O') {
						styleIcon = 'fas fa-align-justify pr-2 media-class';
					} else if (data.listTopicsMedia[i].tipoMidia == 'I') {
						styleIcon = 'fas fa-project-diagram pr-2 media-class';
					} else if (data.listTopicsMedia[i].tipoMidia == 'Q') {
						styleIcon = 'far fa-smile pr-2 media-class';
					} else if (data.listTopicsMedia[i].tipoMidia == 'L') {
						styleIcon = 'fas fa-pager pr-2 media-class';
					} else if (data.listTopicsMedia[i].tipoMidia == '') {
						styleIcon = 'fas fa-comments pr-2 media-class';
					}
					if (isComplement == false) complement = '';
					styleIcon += ' ' + corIcon;

					if (data.listTopicsMedia[i].liberado == 0) {
						contentHtml += '<li class="li-topico-video" onclick="openMedia(event, \'' + data.token + '-' + data.listTopicsMedia[i].token + '\', \'' + data.listTopicsMedia[i].titulo + '\', \'' + data.listTopicsMedia[i].tipoMidia + '\')"><i class="' + styleIcon + '" id="iconMedia' + data.listTopicsMedia[i].token + '"></i>' + data.listTopicsMedia[i].titulo + complement + '</li>';
					} else if (data.listTopicsMedia[i].liberado == 1) {
						complement = '<span class="ml-1 badge badge-primary float-right mt-2 p-1">Data da Liberação: ' + data.listTopicsMedia[i].textoLiberacao + '</span>';
						contentHtml += '<li class="li-topico-video" onclick="openMediaAlert(event, \'Este conteúdo estará liberado na data: ' + data.listTopicsMedia[i].textoLiberacao + '\')"><i class="' + styleIcon + '" id="iconMedia' + data.listTopicsMedia[i].token + '"></i>' + data.listTopicsMedia[i].titulo + complement + '</li>';
					} else if (data.listTopicsMedia[i].liberado == 2) {
						complement = '<span class="ml-1 badge badge-primary float-right mt-2 p-1">Em breve este conteúdo estará disponível</span>';
						contentHtml += '<li class="li-topico-video" onclick="openMediaAlert(event, \'Em breve este conteúdo estará disponível\')"><i class="' + styleIcon + '" id="iconMedia' + data.listTopicsMedia[i].token + '"></i>' + data.listTopicsMedia[i].titulo + complement + '</li>';
					}
				}
			}
			contentHtml += '</ul>';

			if ($('#' + token + local).length == 0) $(objectMain).html(contentHtml);
			$('#' + token + local).collapse('show');
		});
	} else {
		if ($('#' + token + local).hasClass('collapse show')) {
			$('#' + token + local).collapse('hide');
		} else {
			$('#' + token + local).collapse('show');
		}
	}
	event.stopPropagation();
}

function getVideoTime(item) {
	$('#' + item.id).data("mouseIsOver", true);
	$.getJSON("/portal/getTempoVideo", { format: "json", chave: item.id, token: $('#token').val() }).done(function(data) {
		var dados = "<b>" + label02 + ": </b>" + data.duracaoFormatado + '<br>';
		if (data.visto == 1) {
			dados += "<b>" + label03 + ": </b>" + label04 + "<br>";
		} else {
			dados += "<b>" + label05 + ": </b>" + data.visualizacoesPossiveis + '<br>';
			dados += "<b>" + label06 + ": </b>" + data.tempoAssistidoFormatado + '<br>';
			dados += "<b>" + label07 + ": </b>" + data.restantes + '<br>';
			dados += "<b>" + label08 + ": </b>" + data.tempoMaxFormatado + '<br>';
			dados += "<b>" + label09 + ": </b>" + data.parouAonde + '<br>';
		}

		$('#' + item.id).popover(
			{
				title: label10,
				content: dados,
				html: true,
				container: "body",
				trigger: "manual",
				placement: "top"
			}
		)
		if ($('#' + item.id).data("mouseIsOver") == true) {
			$('#' + item.id).popover('show')
		}
	});
}

function closeVideoTime(item) {
	$('#' + item.id).data("mouseIsOver", false);
	$('#' + item.id).popover('hide');
}

function openMedia(event, id, titulo, tipo) {
	
	if (tipo != 'A') {
		if (titulo != '') $('#modalTitle').text(titulo)
		if ($('#modal1').length > 0) $('#modal1').modal('show');
		if ($('#modal1').length > 0) $('#modal1').css('padding-right', '0');
		$('#tipo').val(tipo);
		$('#iFrameDocument').addClass('d-none')
		$('#divDocument').addClass('d-none')
		if ($('#modalBodyMedia').length > 0) $('#modalBodyMedia').removeClass('d-none');
		if ($('#modalBodyMediaTeacher').length > 0) {
			$('#modalBodyMediaTeacher').show();
			$('#modalBodyMediaTeacher').removeClass('d-none');
		}
	}
	
	var url = '/portal/media?token=' + id;
	$.ajax({
		url: url,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			console.log(data);
			
			if (tipo == 'A') {
				if (titulo != '') $('#modalTitle').text(titulo)
				if ($('#modal1').length > 0) $('#modal1').modal('show');
				if ($('#modal1').length > 0) $('#modal1').css('padding-right', '0');
				$('#tipo').val(tipo);
				$('#iFrameDocument').addClass('d-none')
				$('#divDocument').addClass('d-none')
				if ($('#modalBodyMedia').length > 0) $('#modalBodyMedia').removeClass('d-none');
				if ($('#modalBodyMediaTeacher').length > 0) {
					$('#modalBodyMediaTeacher').show();
					$('#modalBodyMediaTeacher').removeClass('d-none');
				}
			}
			
			if (typeof resetDocumentoDRM === 'function') {
				resetDocumentoDRM();
			}

			if ($('#modalBodyMedia').length > 0) $('#modalBodyMedia').html(data);
			if ($('#modalBodyMediaTeacher').length > 0) $('#modalBodyMediaTeacher').html(data);
			if (tipo == 'D' || tipo == 'U') marcaVistoIcone(id);
			if ($('#descricaoVideo').length > 0 && $('#descricaoVideo').val().length > 0 && $('#videoText').length > 0) {
				$('#videoText').text($('#descricaoVideo').val());	
			}
		},
		error: function(xhr, textStatus, errorThrown) {
			if (xhr.status === 404) {
				alert('Conteúdo não encontrado.');
				return;
			}
		
			console.error('Erro ao carregar:', xhr.status, errorThrown);
			alert('Não foi possível carregar o conteúdo.');
		}		
		
	});
	if (event != null) event.stopPropagation();
}

function marcaVistoIcone(id){
	if($('#icone-' + id).length > 0) {
		$('#icone-' + id).addClass('complete');
	}
}
function openMediaAlert(event, message) {

	alert(message);
	if (event != null) event.stopPropagation();
}

function getDisciplina() {
	if ($('#idCurso').val() != '') {
		$.getJSON("/portal/getDisciplina", { format: "json", idCurso: $('#idCurso').val() }).done(function(data) {
			$("#idDisciplina").empty();
			$("#idDisciplina").append($("<option></option>").val('').html(label11));
			$.each(data, function() {
				$("#idDisciplina").append($("<option></option>").val(this['id']).html(this['nome']));
			});
			$("#idDisciplina").val($("#idDisciplina").data('value'));
			if ($("#idDisciplina option").length == 2) {
				$("#idDisciplina").prop("selectedIndex", 1);
			}
			$("#idDisciplina").change();
		});
	}
}

function getProfessor() {
	if ($('#idCurso').val() != '' && $('#idDisciplina').val() != '') {
		$.getJSON("/portal/getProfessor", { format: "json", idCurso: $('#idCurso').val(), idDisciplina: $('#idDisciplina').val() }).done(function(data) {
			$("#idProfessor").empty();
			$("#idProfessor").append($("<option></option>").val('').html(label12));
			$.each(data, function() {
				$("#idProfessor").append($("<option></option>").val(this['id']).html(this['apelido']));
			});
			$("#idProfessor").val($("#idProfessor").data('value'));
			if ($("#idProfessor option").length == 2) {
				$("#idProfessor").prop("selectedIndex", 1);
			}
		});
	}
}

function setAlunoQuestao(idQuestao, idAlternativa) {
	$.getJSON("/portal/setAlunoQuestao", { format: "json", idQuestao, idAlternativa }).done(function(data) {
		var descri = document.getElementById("desc" + idAlternativa);
		descri.style.fontWeight = 700;
		var certo = document.getElementById("opcao" + data.idAlternativaCerta);
		certo.style.backgroundColor = '#90EE90';
		if (data.acertou == "N") {
			var errado = document.getElementById("opcao" + idAlternativa);
			errado.style.backgroundColor = '#FF6961';
		}

		$(":radio").click(function() {
			var radioName = $(this).attr("name"); //Get radio name
			$(":radio[name='" + radioName + "']").attr("disabled", true); //Disable all with the same name
		});
	});
}

function randomIntFromInterval(min, max) { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function stamp(posicao, x, y, height, width, degrees, firstPage, texto, helveticaFont) {
	var siteFont = 15;
	if (posicao == 1) {
		x = 0;
		y = height - 8;
		degrees = 0;
	} else if (posicao == 2) {
		x = 20;
		y = 10;
		degrees = 90;
	} else if (posicao == 3) {
		x = 0;
		y = 0;
		degrees = 0;
	} else if (posicao == 4) {
		x = 10;
		y = 0;
		degrees = 55;
	} else if (posicao == 6) {
		siteFont = 5;
	}
	firstPage.drawText(texto, {
		x: x,
		y: y,
		size: siteFont,
		font: helveticaFont,
		opacity: opacity,
		color: PDFLib.rgb(colorR, colorG, colorB),
		rotate: PDFLib.degrees(degrees),
	});
}

function stamper(pdfUrl, texto, arquivo, tipo, botao, modal, iframeDocumento, posicao, mobile) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', pdfUrl, true);
	xhr.responseType = 'arraybuffer';
	texto = removeAcento(texto);

	xhr.onload = function(e) {
		if (xhr.status == 200) {
			var buffer = xhr.response;
			PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true }).then(function(pdfDoc) {
				pdfDoc.getPages();
				return pdfDoc;
			}).catch(function(err) {
				console.warn('pdf-lib nao conseguiu ler o PDF, reconstruindo com pdf.js', err);
				return reconstruirPdfProtegido(buffer);
			}).then(function(pdfDoc) {
				continuarStamper(pdfDoc, texto, arquivo, tipo, botao, modal, iframeDocumento, posicao, mobile);
			}).catch(function(err) {
				console.error('Falha ao processar PDF', err);
				if (botao != null) {
					$('#' + botao).removeAttr('disabled');
				}
				if (modal != null) {
					$("#" + modal).modal("hide");
				}
				alert('Nao foi possivel abrir este PDF. O arquivo pode estar corrompido ou protegido.');
			});
		}
	};

	xhr.send();


}

function reconstruirPdfProtegido(buffer) {
	if (typeof pdfjsLib === 'undefined') {
		return Promise.reject(new Error('pdf.js indisponivel'));
	}
	if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
		pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
	}
	var data = new Uint8Array(buffer.slice(0));
	return pdfjsLib.getDocument({ data: data }).promise.then(function(pdf) {
		return PDFLib.PDFDocument.create().then(function(novoDoc) {
			var indice = 1;
			function processarPagina() {
				if (indice > pdf.numPages) {
					return novoDoc;
				}
				return pdf.getPage(indice).then(function(page) {
					var viewportBase = page.getViewport({ scale: 1 });
					var escala = 2;
					var viewport = page.getViewport({ scale: escala });
					var canvas = document.createElement('canvas');
					canvas.width = viewport.width;
					canvas.height = viewport.height;
					var ctx = canvas.getContext('2d');
					return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function() {
						var jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
						canvas.width = 0;
						canvas.height = 0;
						return novoDoc.embedJpg(jpegDataUrl);
					}).then(function(imagem) {
						var novaPagina = novoDoc.addPage([viewportBase.width, viewportBase.height]);
						novaPagina.drawImage(imagem, {
							x: 0,
							y: 0,
							width: viewportBase.width,
							height: viewportBase.height
						});
						indice = indice + 1;
						return processarPagina();
					});
				});
			}
			return processarPagina();
		});
	});
}

function continuarStamper(pdfDoc, texto, arquivo, tipo, botao, modal, iframeDocumento, posicao, mobile) {
	if ($('#nomeAula').length > 0) pdfDoc.setTitle($('#nomeAula').val());
	pdfDoc.setAuthor($(document).attr("title"));
	pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica).then(function(helveticaFont) {
		var pages = pdfDoc.getPages();
		var i;
		for (i = 0; i < pages.length; ++i) {
			var firstPage = pages[i];
			var dim = firstPage.getSize();
			var height = dim.height;
			var width = dim.width;
			var x = 0;
			var y = 0;
			var degrees = 0;

			if (posicao == 5) {
				stamp(posicao, 0, height - 8, height, width, 0, firstPage, texto, helveticaFont);
				stamp(posicao, 20, 10, height, width, 90, firstPage, texto, helveticaFont);
				stamp(posicao, 0, 0, height, width, 0, firstPage, texto, helveticaFont);
				stamp(posicao, 10, 0, height, width, 55, firstPage, texto, helveticaFont);
			} else if (posicao == 6) {
				var arrayTexto = texto.split(';');
				x = randomIntFromInterval(100, width - 100);
				y = randomIntFromInterval(100, height - 100);
				stamp(posicao, x, y, height, width, 0, firstPage, arrayTexto[0], helveticaFont);
				stamp(posicao, width / 2, height / 2, height, width, 0, firstPage, arrayTexto[0], helveticaFont);
				stamp(4, x, y, height, width, 0, firstPage, arrayTexto[1], helveticaFont);
			} else {
				stamp(posicao, x, y, height, width, degrees, firstPage, texto, helveticaFont);
			}

		}

		pdfDoc.save().then(function(pdfBytes) {
			if (tipo == 'I') {
				var blob = new Blob([pdfBytes], { type: 'application/pdf' });
				var blob_src = URL.createObjectURL(blob);
				if (mobile == true || mobile == 'true') {
					gerarPDF('divDocument', blob_src, 0, 0, null);
				} else {

					if (iframeDocumento != null && iframeDocumento.length > 0) {
						$('#' + iframeDocumento).attr('src', blob_src);
					} else {
						window.location.href = blob_src;
					}
				}
			} else {
				download(pdfBytes, arquivo, "application/pdf");
			}
		});

		if (botao != null) {
			$('#' + botao).removeAttr('disabled');
		}
		if (modal != null) {
			setTimeout(function() {
				$("#" + modal).modal("hide");
			}, 500);
		}

	});
}


$(document).on("click", '[name="btnMaterialDownload"]', function() {

	$('#btnMaterialDownload' + $(this).data('value')).prop("disabled", "true");
	$('#btnMaterialDownload' + $(this).data('value')).data('html', $('#btnMaterialDownload' + $(this).data('value')).html());
	$('#btnMaterialDownload' + $(this).data('value')).html('<span class="icon"> <i class="fal fa-hourglass-half" aria-hidden="true"></i></span>');
	
	$("#modalLoading").modal({
		backdrop: "static",
		keyboard: false,
		show: true
	});
	var id = $(this).data('value');
	var token = $(this).data('token');
	var frame = $(this).data('frame');

	var path = $(this).data('path');
	var posicao = $(this).data('posicao');
	if (path.toLowerCase().substr(-3) != 'pdf') posicao = 0;

	gerarPDFStamper(posicao, id, 'D', token, 'btnMaterialDownload' + id, 'modalLoading', frame, false);

});

function gerarPDFStamper(posicao, id, tipo, token, btnMaterialDownload, modalLoading, iframeDocumento, mobile, tipoDocumento) {
	
	if (posicao != null && posicao > 0 && posicao < 10) {
		if (tipoDocumento == 'D' && (mobile == false || mobile == 'false')) {
			$('#divDocument').hide();
			$('#' + iframeDocumento).show();
		} else {
			$('#divDocument').show();
			$('#' + iframeDocumento).hide();
			mobile = true;
		}
		fetch('/portal/documento-online-key?idDocumento=' + id + '&tipo=' + tipo + '&token=' + token).then(response => {
			return response.json();
		}).then(function(data) {
			if (data != null) {
				stamper(data.url, data.nome, data.arquivo, data.tipo, btnMaterialDownload, modalLoading, iframeDocumento, posicao, mobile);
		  		if ($('.divDocumentoAguarde').length > 0) $('.divDocumentoAguarde').hide();
				habilitaBotaoDownload(btnMaterialDownload);
		  		
			}
		}).catch(err => {
			alert('Erro na busca do documento');
			if (modalLoading != null) {
				setTimeout(function() {
					$("#" + modalLoading).modal("hide");
			  		if ($('.divDocumentoAguarde').length > 0) $('.divDocumentoAguarde').hide();
					if (btnMaterialDownload != null) $('#' + btnMaterialDownload).removeAttr('disabled');
				}, 500);
			}
			habilitaBotaoDownload(btnMaterialDownload);

		});
	} else {

		if (iframeDocumento != null) {
			var filenameurl = $('#path').val().replace(/\.pdf$/i, '');
			$('#divDocument').hide();
			$('.divDocumentoAguarde').show();
			$('#' + iframeDocumento).attr('src', '/portal/documento-marcado/' +  filenameurl + '?tipo=' + tipo + '&idDocumento=' + id + '&token=' + token);
			$('#' + iframeDocumento).on('load', function () {
			  $('.divDocumentoAguarde').hide();
			});
		} else {
			var filename;
			fetch('/portal/documento-marcado?tipo=' + tipo + '&idDocumento=' + id + '&token=' + token)
				.then(res => {
					filename = res.headers.get('content-disposition').split('filename=')[1];
					return res.blob();
				})
				.then(blob => {
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.style.display = 'none';
					a.href = url;
					a.download = filename;
					document.body.appendChild(a);
					a.click();
					window.URL.revokeObjectURL(url);
					habilitaBotaoDownload(btnMaterialDownload);
				}).catch(function(error) {
					$("#modalLoading").modal("hide");
					console.error(error);
				});
		}
	}
}

function habilitaBotaoDownload(btnMaterialDownload) {
	if ($('#' + btnMaterialDownload).length > 0) {
		if ($('#' + btnMaterialDownload).data('html') != null && $('#' + btnMaterialDownload).data('html').length > 0) {
			$('#' + btnMaterialDownload).html($('#' + btnMaterialDownload).data('html'));
		}
		$('#' + btnMaterialDownload).removeAttr('disabled');
		setTimeout(function() {
			$("#modalLoading").modal("hide");
			if (btnMaterialDownload != null) $('#' + btnMaterialDownload).removeAttr('disabled');
		}, 500);
	}
}

$('.btnDownloadTrilha').click(function() {
	downloadArquivoTrilha($(this).attr('id'));
});

function downloadArquivoTrilha(idButton) {
	var id = $('#idDocumento').val();
	var path = $('#path').val();
	var posicao = $('#posicao').val();
	var token = $('#token').val();

	if (path != '' && path.toLowerCase().substr(-3) != 'pdf') posicao = 0;

	gerarPDFStamper(posicao, id, 'D', token, idButton, 'modalLoading', null, false, 'D');

}

function downloadFromFrame() {
	$('#btnDownloadDownloadFrame').prop("disabled", "true");
	$("#modalLoading").modal({
		backdrop: "static",
		keyboard: false,
		show: true
	});
	var id = $('#btnDownloadDownloadFrame').data('value');
	var token = $('#btnDownloadDownloadFrame').data('token');
	var frame = $('#btnDownloadDownloadFrame').data('frame');

	var path = $('#btnDownloadDownloadFrame').data('path');
	var posicao = $('#btnDownloadDownloadFrame').data('posicao');
	if (path.toLowerCase().substr(-3) != 'pdf') posicao = 0;

	gerarPDFStamper(posicao, id, 'D', token, 'btnDownloadDownloadFrame', 'modalLoading', frame, false);
}

$('[name="btnDownloadBoleto"]').click(function() {
	window.open('/portal/boleto-download?id=' + $(this).data('value'), '_self');
});

$(document).on("click", '[name="btnMaterialView"]', function() {
	$('#modalBodyMedia').addClass('d-none')
	$('#iFrameDocument').removeClass('d-none');
	$('#divDocument').removeClass('d-none');
	$('#modalDialog1').width('100%');
	$('#modalDialog1').height('100%');
	$('#modalDialog1').css('max-width', '100%');
	$('.modal-content').css('background-color', '#FFFFFF');
	if ($('#modalBodyMediaTeacher').length > 0) $('#modalBodyMediaTeacher').hide();
	copyDownloadButton($(this).data('value'));
	
	var heightVideo = $(window).height() - 50;
	if ($('#iFrameDocument').length > 0) $('#iFrameDocument').height(heightVideo);
	if ($('#divDocument').length > 0) $('#divDocument').height(heightVideo);
	
	$('#btnDownload').data('value', $(this).data('value'))

	$('#modalTitle').text($(this).data('title'))
	$('#modal1').modal('show');
	
	if ($(this).data('tipo') == 'D') {
		if ($(this).data('mobile') == true) {
			$('#divDocument').show();
			$('#iFrameDocument').hide();
		} else {
			$('#divDocument').hide();
			$('#iFrameDocument').show();
		}
		$('#btnDownload').show();
	} else if ($(this).data('tipo') == 'C') {
		$('#divDocument').hide();
		$('#iFrameDocument').show();
		$('#btnDownload').show();
	} else if ($(this).data('tipo') == 'L') {
		$('#divDocument').hide();
		$('#iFrameDocument').show();
		$('#btnDownload').hide();
	} else if ($(this).data('tipo') == 'S') {
		$('#iFrameDocument').hide();
		$('#divDocument').show();
		$('#btnDownloadDownloadFrame').hide();
	}
	var path = $(this).data('path');
	var posicao = $(this).data('posicao');
	if (path.toLowerCase().substr(-3) != 'pdf') posicao = 0;

	carregarMaterial($(this).data('tipo'), $(this).data('value'), $(this).data('token'), path, $(this).data('inicial'), $(this).data('final'), 'divDocument', 'iFrameDocument', posicao, $(this).data('mobile'));
});

function carregarMaterial(tipo, idDocumento, token, path, paginaInicial, paginaFinal, divDocumento, iframeDocumento, posicao, mobile) {

	if (tipo == 'D') {
		if (posicao != null && posicao > 0 && posicao < 10) {
			fetch('/portal/documento-online-key?idDocumento=' + idDocumento + '&tipo=I&token=' + token).then(response => {
				return response.json();
			}).then(function(data) {
				if (data != null) {
					stamper(data.url, data.nome, data.arquivo, data.tipo, 'btnMaterialDownload' + idDocumento, 'modalLoading', iframeDocumento, posicao, mobile);
				}
			}).catch(err => {
				$('#btnMaterialDownload' + idDocumento).removeAttr('disabled');
				alert('Erro na busca do documento');
				setTimeout(function() {
					$("#modalLoading").modal("hide");
				}, 500);
			});
		} else {
			$('.divDocumentoAguarde').show();
			var filenameurl = path.replace(/\.pdf$/i, '');
			$('#' + iframeDocumento).attr('src', '');
			$('#' + iframeDocumento).attr('src', '/portal/documento-marcado/' + filenameurl + '?tipo=I&idDocumento=' + idDocumento + '&token=' + token);
			$('#' + iframeDocumento).on('load', function () {
			  $('.divDocumentoAguarde').hide();
			});
		}
	} else if (tipo == 'S') {
		loadDocument(idDocumento);
		gerarPDFDocumento(divDocumento, idDocumento, 'I', token, paginaInicial, paginaFinal);
	} else if (tipo == 'L') {
		$.getJSON("/portal/getLettore", { format: "json" }).done(
			function(data) {
				if (data != null && data.status == 0) {
					var url = 'https://ebooks.hexag.online/embed/' + path;
					if (paginaInicial != null && paginaInicial > 0) url += '/' + paginaInicial;
					if (paginaFinal != null && paginaFinal > 0) url += '/' + paginaFinal;
					url += '?token=' + data.message
					$('#' + iframeDocumento).attr('src', url);
				} else {
					alert(data.message);
				}
			});
	}
}

$('#btnInquirySend').click(function() {
	
	if ($("#inquiryForm").valid() == false) {
        return false;
    }
    
    $(this).prop('disabled', true);
	
	$.post("/portal/salvarDuvida", $("#inquiryForm").serialize(), function(data) {
		if (data.status == 0) {
			location.href = data.message;
		} else {
			alert(data.message);
			$('#btnInquirySend').prop('disabled', false);

		}
	}, 'json');
});

$('#btnForumSend').click(function() {
	if (!$("#forumForm").valid()) {
		return;
	}
	$.post("/portal/salvarForum", $("#forumForm").serialize(), function(data) {
		if (data.status == 0) {
			location.href = data.message;
		} else {
			alert(data.message);
		}
	}, 'json');
});


function salvarComentarioForum(layout) {
	if ($("#comment").val().length == 0) return;
	$.post("/portal/salvarComentario", { idForum: $("#idForum").val(), comentario: $("#comment").val() }, function(data) {
		var content = '';
		if (layout == 2) {
			content += '<div class="wrapper-inner"><div class="row"><div class="col-list-outer"><div class="row"><div class="col-list-inner">';
			content += '<div class="list-image"><div class="image">';
			if (data.pathFotoTemp != null) {
            	content += '<div class="avatar">';
                content += '<img class="mr-3 img-thumbnail" src="' + data.pathFotoTemp + '" width="50px" height="50px">';
                content += '</div>';
            } else {
            	content += '<div class="media">';
            	content += '<span class="user-initials">' + data.nomePrimeiraLetra + '</span>';
            	content += '</div>';
			}
            content += '</div></div></div>';
            content += '<div class="col-list-inner"><div class="inner"><div><div class="list-text">';
			content += '<div class="title">';
            content += '<h3>' + data.primeiroNome + '</h3>';
            content += '</div>';
            content += '</div>';
            content += '<div class="list-time">';
            content += '<span> <span> ' + data.dataInclusaoFormatada + '</span>';
            content += '</span>';
            content += '</div></div>';
            content += '<div class="list-quote"><div class="quote">';
            content += '<span> ' + data.comentario + ' </span>';
            content += '</div></div></div></div></div></div></div></div>';
		} else {
			content += '<div class="media">';
			if (data.pathFotoTemp != null) {
				content += '<div class="avatar"><img class="mr-3 img-thumbnail" src="' + data.pathFotoTemp + '" width="50px" height="50px"></div>';
			} else {
				content += '<div class="media"><span class="user-initials">' + data.nomePrimeiraLetra + '</span></div>';
			}
			content += '<div class="media-body"><h5 class="mt-0 forum-comment-title">' + data.primeiroNome + ' - ' + data.dataInclusaoFormatada + '</h5>' + data.comentario + '</div></div><hr>';
		}
		$('#listComments').append(content);
		$("#comment").val('');
	}, 'json');
}

$('#idTipoRequerimento').change(function() {
	var data = $('#idTipoRequerimento').val();
	var arrayTipo = data.split('-');

	if (arrayTipo[1] == 'S') {
		$("#divCurso").show();
	} else {
		$("#divCurso").hide();
	}
	if (arrayTipo[3] == 'S') {
		$("#divMotivoCancelamento").show();
	} else {
		$("#divMotivoCancelamento").hide();
	}
	if (arrayTipo[2] == 'S') {
		getCursos(null);
	} else {
		getCursos("'A'");
	}
});

$('#fileUpload').change(function(event) {
	var files = event.target.files;
	if ($("#btnAvaliacaoFileSend").length) $('#btnAvaliacaoFileSend').prop('disabled', true);
	receberVariosArquivos(files, $(this).data('type'), $(this).data('id'), $(this).data('directory'), null, false);
});

function receberVariosArquivos(files, tipo, idUser, directory, nomeCampoTemp, dataDelete) {

	var divFileUpload = $('#divFileUpload' + tipo);
	var numberItens = $('div[id^="divBoxFile"]').length;

	for (var i = 0; i < files.length; i++) {
		var index = i + numberItens;

		//Box para o arquivo
		var divBoxFile = $("<div/>");
		divBoxFile.attr('id', 'divBoxFile' + index);
		divFileUpload.append(divBoxFile);

		var labelDocumento = document.createElement('input');
		labelDocumento.type = 'hidden';
		
		if (nomeCampoTemp != null) {
			labelDocumento.name = nomeCampoTemp;
	        labelDocumento.id = nomeCampoTemp;
		} else {
			labelDocumento.name = 'itemNomeArquivo' + tipo;
			labelDocumento.id = 'labelDocumento' + tipo + index;
		}
		labelDocumento.value = converteArquivoInternet(files[i].name);
		divFileUpload.append(labelDocumento);

		var divFileProgress = $("<div/>");
		divFileProgress.attr('id', 'divFileProgress' + index);
		divFileProgress.addClass('float-left w-100 progress');
		divFileProgress.append('<div class="progress-bar bg-success" role="progressbar" id="progress' + tipo + index + '" style="width: 0%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>');
		divFileUpload.append(divFileProgress);

		uploadFile(files[i], index, tipo, idUser, directory, dataDelete);
	}
}

function uploadFile(file, indice, tipo, idUser, directory, dataDelete) {
	var nameFile = converteArquivoInternet(file.name);
	var formData = new FormData();
	formData.append("file", file, idUser + "." + nameFile);
	formData.append('diretorio', directory);
	formData.append('delete', dataDelete);
	if ($('#pathTempDocumento').length > 0) $('#pathTempDocumento').val(nameFile);

	var xhr = new XMLHttpRequest();
	xhr.upload.addEventListener("progress", function(e) { uploadProgress(e, indice, tipo) }, false);
	xhr.addEventListener("progress", function(e) { uploadProgress(e, indice, tipo) }, false);
	xhr.addEventListener("load", function(e) { uploadComplete(e, indice, tipo, directory, nameFile, idUser) }, false);
	xhr.open("POST", "/portal/RecebeArquivo", true);
	xhr.send(formData);
}

function uploadProgress(event, indice, tipo) {
	var progress = Math.round(event.loaded / event.total * 100);
	$('#progress' + tipo + indice).width(progress + '%');
}

function uploadComplete(event, index, tipo, directory, nameFile, idUser) {

	//Verifica se arquivo esta la
	$.post("/portal/verificaArquivoProfessor", { directory: directory, nameFile: nameFile, idUser:idUser}, function(data) {
		if (data.status == 0) {
			$('#progress' + tipo + index).width('100%');
			alert(data.message);
			if ($("#btnAvaliacaoFileSend").length) $('#btnAvaliacaoFileSend').prop('disabled', false);
			if ($("#btnSalvarDocumentoAluno").length) $('#btnSalvarDocumentoAluno').prop('disabled', false);

			//Inativa o progress
			$('#divFileProgress' + index).remove();

			//Cria os itens de download e delete
			var divBoxFile = $('#divBoxFile' + index);
			var divFileDoc = $("<div/>");
			divFileDoc.attr('id', 'divFileDoc' + index);
			divFileDoc.addClass('float-left mr-1');
			divFileDoc.html('<a href="javascript:dowloadArquivoTemp(\'' + directory + '\',\'' + nameFile + '\');">' + nameFile + '</a>');
			divBoxFile.append(divFileDoc);
			var divFileDocX = $("<div/>");
			divFileDocX.attr('id', 'divFileDocX' + index);
			divFileDocX.addClass('float-left mr-1');
			divFileDocX.html('<a href="javascript:apagarArquivoUpload(' + index + ',\'' + tipo + '\',\'' + directory + '\',\'' + nameFile + '\')" class="txtFonteArquivo">X</a>');
			divBoxFile.append(divFileDocX);
		} else {
			alert(data.message);
			if ($("#btnAvaliacaoFileSend").length) $('#btnAvaliacaoFileSend').prop('disabled', true);
			$("#divBoxFile" + index).remove()
			$("#divFileProgress" + index).remove()
			$('#fileUpload').val('');
		}
	}, 'json');

}

function apagarArquivoUpload(indice, tipo, directory, nameFile) {
	if (confirm('Confirma apagar o arquivo: ' + nameFile + '?') == true) {
		$.post("/portal/deleteFile", { directory: directory, nameFile: $("#labelDocumento" + tipo + indice).val() }, function(data) { }, 'json');
		$('#divBoxFile' + indice).remove();
		$('#fileUpload').val('');
	}
}

function dowloadArquivoTemp(directory, nameFile) {
	window.open('/portal/dowloadArquivoTemp?directory=' + directory + '&nameFile=' + nameFile, '_self');
}


function converteArquivoInternet(texto) {

	var nome = texto;
	var extensao = "";

	var posicao = texto.lastIndexOf(".");
	if (posicao > 0) {
		nome = texto.substring(0, posicao);
		extensao = texto.substring(posicao);
	}


	var nomeTemp = nome;
	var nome = '';
	for (var i = 0; i < nomeTemp.length; i++) {
		if (nomeTemp[i].charCodeAt(0) < 255) {
			nome += nomeTemp[i];
		}
	}

	nome = removeAcento(nome);
    nome = nome.replace(/[`~!@#$%^&*()_|ªº°+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '-');    
	nome = nome.trim().replace(/[.]/gi, "");
	nome = nome.trim().replace(/  /gi, " ");
	nome = nome.replace(/[ ]/gi, "-");
	nome = nome.replace(/[+?]/gi, "-");
	nome = nome.replace(/--/gi, "-");
	nome = nome.replace(/--/gi, "-");
	nome = nome.replace(/--/gi, "-");
	nome = nome.replace(/[,]/gi, "");
	nome = nome.replace(/[:]/gi, "");

	return nome + extensao;
}

function removeAcento(texto) {

	// acento agudo
	texto = texto.replace(/[á]/gi, "a");
	texto = texto.replace(/[é]/gi, "e");
	texto = texto.replace(/[í]/gi, "i");
	texto = texto.replace(/[ó]/gi, "o");
	texto = texto.replace(/[ú]/gi, "u");
	texto = texto.replace(/[Á]/gi, "A");
	texto = texto.replace(/[É]/gi, "E");
	texto = texto.replace(/[Í]/gi, "I");
	texto = texto.replace(/[Ó]/gi, "O");
	texto = texto.replace(/[Ú]/gi, "U");

	// acento circunflexo
	texto = texto.replace(/[â]/gi, "a");
	texto = texto.replace(/[ê]/gi, "e");
	texto = texto.replace(/[î]/gi, "i");
	texto = texto.replace(/[ô]/gi, "o");
	texto = texto.replace(/[û]/gi, "u");
	texto = texto.replace(/[Â]/gi, "A");
	texto = texto.replace(/[Ê]/gi, "E");
	texto = texto.replace(/[Î]/gi, "I");
	texto = texto.replace(/[Ô]/gi, "O");
	texto = texto.replace(/[Û]/gi, "U");

	// til
	texto = texto.replace(/[ã]/gi, "a");
	texto = texto.replace(/[õ]/gi, "o");
	texto = texto.replace(/[Ã]/gi, "A");
	texto = texto.replace(/[Õ]/gi, "O");

	// ce-cedilha
	texto = texto.replace(/[ç]/gi, "c");
	texto = texto.replace(/[Ç]/gi, "C");

	// trema
	texto = texto.replace(/[ü]/gi, "u");
	texto = texto.replace(/[Ü]/gi, "U");

	// crase
	texto = texto.replace(/[à]/gi, "a");
	texto = texto.replace(/[è]/gi, "e");
	texto = texto.replace(/[ì]/gi, "i");
	texto = texto.replace(/[ò]/gi, "o");
	texto = texto.replace(/[ù]/gi, "u");
	texto = texto.replace(/[À]/gi, "A");
	texto = texto.replace(/[È]/gi, "E");
	texto = texto.replace(/[Ì]/gi, "I");
	texto = texto.replace(/[Ò]/gi, "O");
	texto = texto.replace(/[Ù]/gi, "U");
	return texto;
}

function getCursos(situacao) {
	getCursos(situacao, false, null);
}

function getCursos(situacao, pacote, duvida) {
	$.getJSON("/portal/getCursos", { format: "json", situacao: situacao, duvida: duvida }).done(function(data) {
		$("#idCurso").empty();
		$("#idCurso").append($("<option></option>").val('').html(label13));
		$.each(data, function() {
			$("#idCurso").append($("<option></option>").val(this['tipoCurso'] + '-' + this['idCurso']).html(this['nomeComercial']));
			if (pacote == true) {
				$.each(this['listaAlunoCursoPacoteTO'], function() {
					$("#idCurso").append($("<option></option>").val(this['tipoCurso'] + '-' + this['idCurso']).html('&nbsp&nbsp' + this['nomeComercial']));
				});
			}
		});
		$("#idCurso").val($("#idCurso").data('value'));
		if ($("#idCurso option").length == 2) {
			$("#idCurso").prop("selectedIndex", 1);
		}
		$("#idCurso").change();
	});
}

$('#btnRequestSend').click(function() {
	if (!$("#requestForm").valid()) {
		return;
	}
	$.post("/portal/salvarRequerimento", $("#requestForm").serialize(), function(data) {
		if (data.status == 0) {
			location.href = data.message;
		} else {
			alert(data.message);
		}
	}, 'json');
});

$("#idEstado").change(function() {
	loadCidade(0, 0);
});

$("#idCidade").change(function() {
	loadBairro(0);
});

function loadBairro(idBairro) {
	if ($("#idCidade").val() == null) return;
	var url = "/listBairro?idCidade=" + $("#idCidade").val();
	$("#idBairro").prop('options').length = 0
	$.getJSON(url, { format: "json" }).done(function(data) {
		$.each(data, function(i, item) {
			$("#idBairro").append($("<option />").val(item.id).text(item.nome));
		});
		if (idBairro > 0) $("#idBairro").val(idBairro);
	});
}

function loadCidade(idCidade, idBairro) {
	if ($("#idEstado").val() == null) return;
	var url = "/listCidade?idEstado=" + $("#idEstado").val();
	$("#idCidade").prop('options').length = 0
	$.getJSON(url, { format: "json" }).done(function(data) {
		$.each(data, function(i, item) {
			$("#idCidade").append($("<option />").val(item.id).text(item.nome));
		});
		if (idCidade > 0) {
			$("#idCidade").val(idCidade);
			if (idBairro > 0) loadBairro(idBairro);
		} else {
			$("#idCidade").change();
		}
	});
}

function loadEstado(idEstado, idCidade, idBairro) {
	var url = "/listEstado";
	$("#idEstado").prop('options').length = 0
	$.getJSON(url, { format: "json" }).done(function(data) {
		$.each(data, function(i, item) {
			$("#idEstado").append($("<option />").val(item.id).text(item.nome));
		});
		if (idEstado > 0) {
			$("#idEstado").val(idEstado);
			if (idCidade > 0) loadCidade(idCidade, idBairro);
		} else {
			$("#idEstado").change();
		}
	});
}

$("#cep").blur(function() {
	if ($('#cep').attr('data-info') != $('#cep').val()) {
		var url = "/cep?cep=" + $("#cep").val();
		$.getJSON(url, { format: "json" }).done(function(data) {
			$("#endereco").val(data.endereco);
			loadEstado(data.bairroTO.cidadeTO.estadoTO.id, data.bairroTO.cidadeTO.id, data.bairroTO.id);
		});
	}
});


$('#btnPerfilSend').click(function() {
	if (!$("#perfilForm").valid()) {
		return;
	}
	$.post("/portal/salvarPerfil", $("#perfilForm").serialize(), function(data) {
		$('#mensagem').text(data.message);
		$('#mensagem').removeClass('invisible');
	}, 'json');
});

$('#modal1').on('hide.bs.modal', function(e) {
	if ($("#gravacao").length = 1 && $("#gravacao").val() == 'S') {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	if (typeof resetDocumentoDRM === 'function') {
		resetDocumentoDRM();
	}

	if (e.target.id != 'modalEstatistica' && e.target.id != 'modalSimulado' && e.target.id != 'dataAgendamento' && e.target.id != 'modalComentario') {
		sincronizarMediaRotina();
		if ($('#modalBodyMedia').length > 0 && $('#modalBodyMedia').html() !== undefined && $('#modalBodyMedia').html().indexOf('iframeBoletim') == -1) {
			$('#modalBodyMedia').html('');
		} else {
			$('#iframeBoletim').attr('src', '');
		}
		$('#modalBodyMedia').html('');
		return true;
	}
})

function sincronizarMediaRotina() {
	if (typeof $('#token').val() !== "undefined") {
		sincronizarVideo(true);
	}
}
function sincronizarVideo(enviar) {
	for (var i = 0; i < localStorage.length; i++) {
		var key = localStorage.key(i);
		if (key.length >= 6) {
			if (key.substring(0, 7) == 'TUTOR2-') {
				var data = localStorage.getItem(key);
				var arrayKey = key.split('-');
				var arrayTempo = data.split('-');
				token = arrayKey[1];
				idVideo = arrayKey[2];
				tipoVideo = arrayKey[3];
				tempoTotal = arrayTempo[0];
				tempoMax = arrayTempo[1];
				tempo1 = arrayTempo[2];
				controleDuracao = arrayTempo[3];
				controleConsumo = arrayTempo[4];
				controlePercentual = arrayTempo[5];

				if (enviar == false) {
					var hora = localStorage.getItem('TUTOR-TIME');
					var horaAtual = getCompleteDate();
					if ((diffHours(horaAtual, hora)) > 300) {
						enviar = true;
					}
				}
				if (enviar == true && tempoTotal > 0) {
					mediaClose(token, idVideo, tipoVideo, tempoTotal, tempoMax, tempo1, controleDuracao, controleConsumo, controlePercentual);
					localStorage.removeItem(key);
				}
			}
		}
	}
}

function mediaClose(token, idVideo, tipoVideo, tempoTotal, tempoMax, tempo, controleDuracao, controleConsumo, controlePercentual) {

	var consumo = false;
	if ($('#spanTempoVisto').length > 0) {
		consumo = true;
	}

	//console.log('mediaClose:' + tempoTotal + '-' + tempoMax + '-' + idVideo + '-' + controleDuracao + '-' + controleConsumo + '-' + controlePercentual);
	
	$.post("/portal/media-close", {
		token: token,
		tipoVideo: tipoVideo,
		tempoTotal: tempoTotal,
		tempoMax: tempoMax,
		tempoUltimo: tempo,
		idVideo: idVideo,
		tipoVideo: tipoVideo,
		consumo: consumo,
		controleDuracao: controleDuracao,
		controleConsumo: controleConsumo,
		controlePercentual: controlePercentual
	}, function(data) {
		if (data != null) {
			if (consumo == true) {
				$('#spanTempoVisto').html(data);
			} else {
				$("#box-consumo").html(label14 + ': ' + data.percentualConsumido + '%');
				$("#box-total").html(label15 + ': ' + data.percentualFinal + '%');
				if (data.alunoCertificado != null && data.alunoCertificado == 'S') {
					$("#divIconCertificado").css("display", "unset");
				}
				$("#controleConsumo").val(data.controleConsumo);
				if (typeof atualizaPercentuais === 'function') {
				    atualizaPercentuais(data);
				}
			}
		}
	}, 'json');
}

function marcarVistoEvent(event, idMediaAtualizar) {
	if (event != null) event.stopPropagation();
	idVideo = $('#iconCheck-' + idMediaAtualizar).data("video");
	if ($('#iconCheck-' + idMediaAtualizar).data("visto") == 1) {
		visto = 0
	} else {
		visto = 1
	}
	marcarVisto($('#token').val(), idVideo, visto, idMediaAtualizar);
}

function marcarVisto(token, idVideo, visto, idMediaAtualizar) {
	$.post("/portal/marcar-visto", {
		token: token,
		idVideo: idVideo,
		visto: visto
	}, function(data) {
		if (data != null) {
			if (data.percentualConsumido != null) $("#box-consumo").html(label14 + ': ' + data.percentualConsumido + '%');
			if (data.percentualFinal != null) $("#box-total").html(label15 + ': ' + data.percentualFinal + '%');
			if (data.alunoCertificado != null && data.alunoCertificado == 'S') {
				$("#divIconCertificado").css("display", "unset");
			}
			if (idMediaAtualizar != null) {
				$('#iconCheck-' + idMediaAtualizar).data("visto", visto);
				$('#iconMedia' + idMediaAtualizar).removeClass('text-checked');
				$('#iconMedia' + idMediaAtualizar).removeClass('text-success');
				$('#iconMedia' + idMediaAtualizar).removeClass('text-dark');
				$('#badgeMedia' + idMediaAtualizar).removeClass('badge-success');
				$('#badgeMedia' + idMediaAtualizar).removeClass('badge-checked');
				$('#badgeMedia' + idMediaAtualizar).removeClass('badge-dark');
				if (visto == 1) {
					$('#badgeMedia' + idMediaAtualizar).addClass('badge-success');
					$('#iconMedia' + idMediaAtualizar).addClass('text-success');
					$('#badgeMedia' + idMediaAtualizar).html(label34);
				} else {
					if (data.maxTempo == 0) {
						$('#badgeMedia' + idMediaAtualizar).addClass('badge-dark');
						$('#iconMedia' + idMediaAtualizar).addClass('text-dark');
						$('#badgeMedia' + idMediaAtualizar).html(label32);
					} else {
						$('#badgeMedia' + idMediaAtualizar).addClass('badge-checked');
						$('#iconMedia' + idMediaAtualizar).addClass('text-checked');
						$('#badgeMedia' + idMediaAtualizar).html(label33 + ' ' + data.maxTempoFormatado);
					}
				}
			}
		}
	}, 'json');
}

$('#btnMaterial').click(function() {
	if ($('#divVideoMaterial').attr('class') == 'd-none') {
		$('#divVideoMaterial').removeClass('d-none')
		$('#divVideoMaterial').addClass('col-md-3')
		$('#divVideoVideo').removeClass('col-md-3')
		$('#divVideoVideo').removeClass('col-md-6')
		$('#divVideoVideo').removeClass('col-md-12')
		$('#divVideoVideo').addClass('col-md-9')
		$('#divVideoChat').addClass('d-none')
		$('#divVideoChat').removeClass('col-md-3')
		$('#divBlocoNota').addClass('d-none');
		$('#divBlocoNota').removeClass('col-md-3');
		$('#divDuvida').addClass('d-none');
		$('#divDuvida').removeClass('col-md-3')
	} else {
		$('#divVideoMaterial').addClass('d-none')
		$('#divVideoMaterial').removeClass('col-md-3')
		$('#divVideoMaterial').removeClass('col-md-6')
		$('#divVideoMaterial').removeClass('col-md-9')
		$('#divVideoVideo').removeClass('col-md-3')
		$('#divVideoVideo').removeClass('col-md-6')
		$('#divVideoVideo').removeClass('col-md-9')
		$('#divVideoVideo').addClass('col-md-12')
	}
});

$('#btnChat').click(function() {
	if ($('#divVideoChat').attr('class') == 'd-none') {
		$('#divVideoMaterial').addClass('d-none')
		$('#divVideoMaterial').removeClass('col-md-3')
		$('#divVideoChat').removeClass('d-none')
		$('#divVideoChat').addClass('col-md-3')
		$('#divVideoVideo').removeClass('col-md-12')
		$('#divVideoVideo').addClass('col-md-9')
		$('#divDuvida').addClass('d-none');
		$('#divDuvida').removeClass('col-md-3')
		$('#divBlocoNota').addClass('d-none');
		$('#divBlocoNota').removeClass('col-md-3');

		var url = '/portal/chat?idChatMultimedia=' + $('#idChatMultimedia').val();
		$.ajax({
			url: url,
			dataType: 'html',
			type: 'GET',
			async: true,
			success: function(data) {
				$('#divVideoChat').html(data);
			}
		});

		scroll();
	} else {
		$('#divVideoChat').addClass('d-none')
		$('#divVideoChat').removeClass('col-md-3')
		$('#divVideoVideo').removeClass('col-md-9')
		$('#divVideoVideo').addClass('col-md-12')
		$('#divVideoChat').html('');
	}
});

function loadTCC() {
	if ($('#idChatMultimedia').length > 0 && $('#idChatMultimedia').val() > 0 && $('#divVideoChat').length > 0 && $('#tokenOrientador').val().length > 0 && $('#tokenAluno').val().length > 0) {

		var url = '/portal/chat?idChatMultimedia=' + $('#idChatMultimedia').val() + '&tokenAluno=' + $('#tokenAluno').val() + '&tokenProfessor=' + $('#tokenOrientador').val();
		$.ajax({
			url: url,
			dataType: 'html',
			type: 'GET',
			async: true,
			success: function(data) {
				$('#divVideoChat').html(data);
			}
		});
		setTimeout("scroll()", 1000);
	}
}


clockCheckOnline(2000)
function clockCheckOnline(tempo) {
	var t = setTimeout("checkOnline()", tempo);
}


function checkOnline() {
	if (window.location.pathname == '/portal/login') return;
	if (window.location.pathname == '/portal/esqueci-a-senha') return;
	if (window.location.pathname == '/portal/validar-login') return;
	if (window.location.pathname == '/portal/validar-login-juspodium') return;
	if (window.location.pathname == '/portal/multiplo-login') return;
	if (window.location.pathname == '/portal/validar-codigo') return;
	if (window.location.pathname == '/portal/enviar-senha') return;
	
	$.getJSON("/portal/checkOnline", { format: "json" }).done(function(data) {
		if (data != null && data.id != null && (data.tipo == 'C' || data.tipo == 'S')) {
			$.notify({ icon: 'glyphicon glyphicon glyphicon-ok', message: data.nome, url: '/portal/aviso-detalhe/' + data.id }, { type: 'info', z_index: 1000000 });
		} else if (data != null && data.titulo != null && data.tipo == 'Q') {
			window.open('/portal/' + data.link + '?chave=' + data.titulo, '_self');
		} else if (data != null && data.titulo != null && data.tipo == 'L') {
			alert(data.titulo);
			window.open('/portal/' + data.link, '_self');
		} else if (data != null && data.id != null && data.tipo == 'P') {
			$('#idContratoPadrao').val(data.id);
			$('#idContratoPadraoContrato').val(data.idAlunoMensalidade);
			$('#dealPopupTitle').html(data.nome);
			$('#dealPopupDescription').html(data.conteudoContrato);
			$('#dealPopup').modal('show');
			$('#dealPopupFrame').hide();
			$('#dealPopupDescription').show();

		} else if (data != null && data.id != null && data.tipo == 'F') {
			if (window.location.pathname != '/portal/' + data.link) {
				$('#modalFormularioFrame').attr('src', '/portal/' + data.link);
				$('#modalFormulario').modal('show');
			}
		}
	}).fail(function(jqXHR) {
        if (jqXHR.status === 401 || jqXHR.status === 403) {
            window.location.href = "/portal/login";
        } else {
            if (jqXHR.responseText.indexOf("<!DOCTYPE html>") !== -1) {
                window.location.href = "/portal/login";
            }
        }
    });
	clockCheckOnline(300000);

}
function closeModal() {
	$("#modalFormulario").modal("hide");
}

function removerArquivoAvaliacao(idAvaliacaoAluno, token) {
	if (confirm('Tem certeza que deseja remover o arquivo?') == true) {
		$.post("/portal/removerArquivoAvaliacao", { idAvaliacaoAluno: idAvaliacaoAluno }, function(data) {
			if (data.message.length > 0) {
				alert(data.message);
			}
			if ($('#modal1').length > 0) {
				document.location.reload(true);
			} else if (data.status == 0) {
				openMedia(event, token);
			}
		}, 'json');
	}
}

function enviarArquivoAvaliacao(idAvaliacaoAluno, idAlunoMensalidade, idAvaliacao, idTopico, tipoCurso, idCurso, token) {
	if (verificaArquivo(document.getElementById('fileUpload'), ",.mp3,.xlsx,.xls,.png,.gif,.jpeg,.jpg,.doc,.docx,.pdf,.ppt,.pptx,", 52428800, '50MB') == false) {
		return false;
	}

	if ($('#btnAvaliacaoFileSend') != null && $('#btnAvaliacaoFileSend').length > 0) {
		$('#btnAvaliacaoFileSend').prop("disabled", true);
	}

	var idAvaliacaoProposta = null;
	if ($('#idAvaliacaoProposta').length > 0) idAvaliacaoProposta = document.getElementById('idAvaliacaoProposta').value;
	$.post("/portal/enviarArquivoAvaliacao", {
		arquivo: converteArquivoInternet(document.getElementById('fileUpload').files[0].name),
		idAvaliacaoAluno: idAvaliacaoAluno,
		idAlunoMensalidade: idAlunoMensalidade,
		idAvaliacao: idAvaliacao,
		idTopico: idTopico,
		tipoCurso: tipoCurso,
		idCurso: idCurso,
		idAvaliacaoProposta: idAvaliacaoProposta
	}, function(data) {

		if (data.message.length > 0) {
			alert(data.message);
		}
		if ($('#listAvaliacoes').length > 0) {
			document.location.reload(true);
		} else if (data.status == 0) {
			openMedia(event, token);
		}
	}, 'json');
}

function enviarTextoAvaliacao(idAvaliacaoAluno, idAlunoMensalidade, idAvaliacao, idTopico, tipoCurso, idCurso, chave) {
	const texto = document.getElementById("textoAvaliacao").value;


	if (texto.length < 1) return false;

	var idAvaliacaoProposta = null;
	if ($('#idAvaliacaoProposta').length > 0) idAvaliacaoProposta = document.getElementById('idAvaliacaoProposta').value;
	$.post("/portal/enviarTextoAvaliacao", {
		texto: texto,
		idAvaliacaoAluno: idAvaliacaoAluno,
		idAlunoMensalidade: idAlunoMensalidade,
		idAvaliacao: idAvaliacao,
		idTopico: idTopico,
		tipoCurso: tipoCurso,
		idCurso: idCurso,
		idAvaliacaoProposta: idAvaliacaoProposta
	}, function(data) {
		if (data.message.length > 0) {
			alert(data.message);
		}
		if (data.status == 0) {
			if ($('#listAvaliacoes').length > 0) {
				location.reload();
			} else if ($('#modal1').length > 0) {
				$('#modal1').modal('hide');
			}
		}
	}, 'json');
}

function verificaArquivo(arquivoParam, extensoesOk, tamanhoArquivo, tamanhoArquivoDescricao) {

	var extensao = ',' + arquivoParam.value.substr(arquivoParam.value.length - 4).toLowerCase() + ',';
	if (extensao.substr(1, 1) != '.') {
		extensao = ',' + arquivoParam.value.substr(arquivoParam.value.length - 5).toLowerCase() + ',';
	}
	if (extensao.substr(1, 1) != '.') {
		alert(label16 + ': ' + extensoesOk.substring(1, extensoesOk.length - 1));
		return false;
	}
	if (arquivoParam.value == "") {
		alert(label17);
		return false;
	} else if (extensoesOk.indexOf(extensao) == -1) {
		alert(label16 + ': ' + extensoesOk.substring(1, extensoesOk.length - 1));
		return false;
	} else if (arquivoParam.files[0].size > tamanhoArquivo) {
		alert(label18 + tamanhoArquivoDescricao + '.');
		return false;
	}
	return true;
}
$('#btnClose1').click(function() {
	if ($('#modalBodyMedia').length > 0 && $('#modalBodyMedia').html() !== undefined && $('#modalBodyMedia').html().indexOf('iframeBoletim') == -1) {
		$('#modalBodyMedia').html('');
	} else {
		$('#iframeBoletim').attr('src', '');
	}
	$('#modal1').modal('hide');
	$('#modal1').hide();
	$('.modal-backdrop').remove();
});

function baixarArquivoAluno(id, nomeArquivo) {
	window.open('/portal/documentoAlunoAvaliacao?idAvaliacaoAluno=' + id + '&nomeArquivo=' + nomeArquivo, '_self');
}

function baixarArquivoProfessor(id, nomeArquivo) {
	window.open('/portal/documentoProfessorAvaliacao?idAvaliacaoAluno=' + id + '&nomeArquivo=' + nomeArquivo, '_self');
}

function abrirAudio() {
	$('#modalTitleAudio').text(label19)
	$('#modalAudio').modal('show');
}

function prepararComentarios() {
	const comentarios = document.getElementById('comentarios');

	if (comentarios.classList.contains('mceEditorComentario')) {
		document.getElementById('comentarios').value = tinymce.get("comentarios").getContent();
	}
}

function salvarAvaliacaoCorrecaoRascunho() {
	if (!$("#correctForm").valid()) {
		return;
	}

	prepararComentarios();

	$.post("/portal/salvarAvaliacaoCorrecaoRascunho", $("#correctForm").serialize(), function(data) {
		if (data.status == 0) {
			location.href = data.message;
		} else {
			alert(data.message);
		}
	}, 'json');
}

function salvarAvaliacaoCorrecao() {
	if (!$("#correctForm").valid()) {
		return false;
	}

	prepararComentarios();

	$.post("/portal/salvarAvaliacaoCorrecao", $("#correctForm").serialize(), function(data) {
		if (data.status == 0) {
			location.href = data.message;
		} else {
			alert(data.message);
		}
	}, 'json');
}


function removerArquivoAvaliacaoProfessor(id, nomeArquivo, item) {
	if (confirm('Deseja realmente excluir o arquivo ' + nomeArquivo + ' ?')) {
		$.post("/portal/removerArquivoAvaliacaoProfessor", { id: id, nomeArquivo: nomeArquivo }, function(data) {
			alert(data.message);
			if (data.status == 0) $(item).parent().remove();
		}, 'json');
	}
}

function proximaPagina(form, pagina, indice) {
	pagina.val(indice);
	form.submit();
}

function salvarRespostaDuvida() {

	if (!$("#inquiryForm").valid()) {
		return false;
	}

	$.post("/portal/salvarRespostaDuvida", $("#inquiryForm").serialize(), function(data) {
		if (data.status == 0) {
			location.href = data.message;
		} else {
			alert(data.message);
		}
	}, 'json');
}

function loadTeacherReport(combo) {

	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var year = currentTime.getFullYear();


	var dateNextMonth = new Date();
	dateNextMonth.setMonth(dateNextMonth.getMonth() + 1);
	var monthNext = dateNextMonth.getMonth() + 1;
	var yearNext = dateNextMonth.getFullYear();

	monthNextString = monthNext;
	if (month < 10) monthNextString = '0' + monthNext;
	combo.append($("<option />").val(monthNextString + '/' + yearNext).text(monthNextString + '/' + yearNext));

	for (i = 1; i <= 12; i++) {
		monthString = month;
		if (month < 10) monthString = '0' + month;

		combo.append($("<option />").val(monthString + '/' + year).text(monthString + '/' + year));
		if ((month - 1) == 0) {
			month = 12;
			year = year - 1;
		} else {
			month--;
		}
	}
	combo.selectedIndex = 1;
	combo.find('option:eq(1)').prop('selected', true);
}



function float2moeda2(num) {
	moeda = float2moeda(num);
	moeda = moeda.replace(",00", "");
	return moeda;
}
function float2moeda(num) {
	x = 0;
	if (num < 0) {
		num = Math.abs(num);
		x = 1;
	}
	if (isNaN(num))
		num = "0";
	cents = Math.floor((num * 100 + 0.5) % 100);
	num = Math.floor((num * 100 + 0.5) / 100).toString();
	if (cents < 10)
		cents = "0" + cents;
	for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
		num = num.substring(0, num.length - (4 * i + 3)) + '.'
			+ num.substring(num.length - (4 * i + 3));
	ret = num + ',' + cents;
	if (x == 1)
		if (num != 0 || cents != '00')
			ret = ' -' + ret;
	return ret;
}

function moeda2float(moeda) {
	moeda = moeda.replace(".", "");
	moeda = moeda.replace(",", ".");
	return parseFloat(moeda);
}

function documentoAlunoRequerimento(id, nomeArquivo) {
	window.open('/portal/documentoAlunoRequerimento?idRequerimento=' + id + '&nomeArquivo=' + nomeArquivo, '_self');
}
function documentoRespostaRequerimento(id, nomeArquivo) {
	window.open('/portal/documentoRespostaRequerimento?idRequerimento=' + id + '&nomeArquivo=' + nomeArquivo, '_self');
}

function openURL(url, contentHTML, modalID) {
	$(modalID).modal('show');
	$.ajax({
		url: url,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			$(contentHTML).html(data);
		}
	});
}

function getAlunos() {
	if ($('#idCurso').val() != '') {
		$.getJSON("/portal/getAlunos", { format: "json", idCurso: $('#idCurso').val(), idAvaliacao: $('#idAvaliacao').val(), idDisciplina: $('#idDisciplina').val() }).done(function(data) {
			$("#tableAluno").empty();
			for (var i = 0; i < data.length; i++) {
				var linha = "<tr><td>" + (i + 1);
				linha += "<input type=\"hidden\" name=\"itemAluno\" id=\"txtAluno" + data[i].pessoaTO.id + "\" size=\"10\" maxlength=\"10\" class=\"form-control\" value=\"" + data[i].pessoaTO.id + "\"></input>";
				linha += "<input type=\"hidden\" name=\"itemContrato\" id=\"txtContrato" + data[i].pessoaTO.id + "\" size=\"10\" maxlength=\"10\" class=\"form-control\" value=\"" + data[i].idContrato + "\"></input>";
				linha += "</td><td>" + data[i].matricula;
				linha += "</td><td>" + data[i].pessoaTO.nome;
				linha += "</td><td><input type=\"text\" name=\"itemNota\" id=\"txtNota" + data[i].pessoaTO.id + "\" size=\"10\" maxlength=\"10\" class=\"form-control\" value=\"" + data[i].notaFormatada + "\"></input>";
				if (data[i].segundaChamada == 'S') {
					linha += "</td><td><input type=\"checkbox\" name=\"itemSegunda\" id=\"itemSegunda" + data[i].pessoaTO.id + "\" value=\"" + data[i].pessoaTO.id + "\" checked>";
				} else {
					linha += "</td><td><input type=\"checkbox\" name=\"itemSegunda\" id=\"itemSegunda" + data[i].pessoaTO.id + "\" value=\"" + data[i].pessoaTO.id + "\">";
				}
				linha += "</td></tr>";
				$("#tableAluno").append(linha);
			}
		});
	}
}

function getCupons() {
	$.getJSON("/portal/getCupons", { format: "json", idProfessor: $('#idProfessor').val() }).done(function(data) {
		$("#tableCupom").empty();
		for (var i = 0; i < data.length; i++) {
			var linha = "<tr><td>" + (i + 1);
			linha += "<input type=\"hidden\" name=\"itemCupom\" id=\"txtCupom" + data[i].id + "\" size=\"10\" maxlength=\"10\" class=\"form-control\" value=\"" + data[i].id + "\"></input>";
			linha += "</td><td>" + data[i].nomePessoa;
			linha += "</td><td>" + data[i].nomeCupom;
			linha += "</td><td>" + data[i].valorCupom;
			linha += "</td></tr>";
			$("#tableCupom").append(linha);
		}
	});

}

function salvarNotas() {
	var valores = '';
	$("input[name='itemAluno']").each(function(i, v) {
		valores += this.value + ';' + $('#txtContrato' + this.value).val() + ';' + $('#txtNota' + this.value).val() + ';' + $('#itemSegunda' + this.value).is(':checked') + '|';
	});
	$('#valores').val(valores)

	if (!$("#correctForm").valid()) {
		return;
	}
	$.post("/portal/salvarNota", $("#correctForm").serialize(), function(data) {
		if (data.status == 0) {
			location.href = data.message;
		} else {
			alert(data.message);
		}
	}, 'json');
}


function setGosto() {
	if ($('#idCurso').val() != '') {
		$.getJSON("/portal/setGosto", { format: "json", idCurso: $('#tipoCurso').val() + '-' + $('#idCurso').val() }).done(function(data) {
			if (data.status == 0) {
				$('#iconeGosto').attr('class', 'far fa-thumbs-up');
				$('#divGostoQuantidade').html(data.message);
			} else {
				$('#iconeGosto').attr('class', 'fas fa-thumbs-up');
				$('#divGostoQuantidade').html(data.message);
			}
		});
	}
}

if ($('#divGostoQuantidade').length > 0) {
	if ($('#idCurso').val() != '') {
		$.getJSON("/portal/getGosto", { format: "json", idCurso: $('#tipoCurso').val() + '-' + $('#idCurso').val() }).done(function(data) {
			if (data.status == 0) {
				$('#iconeGosto').attr('class', 'far fa-thumbs-up');
				$('#divGostoQuantidade').html(data.message);
			} else {
				$('#iconeGosto').attr('class', 'fas fa-thumbs-up');
				$('#divGostoQuantidade').html(data.message);
			}
		});
	}
}


function setFavorito() {
	if ($('#idCurso').val() != '') {
		$.getJSON("/portal/setFavorito", { format: "json", idCurso: $('#tipoCurso').val() + '-' + $('#idCurso').val() }).done(function(data) {
			if (data.status == 0) {
				$('#iconeFavorito').attr('class', 'far fa-star');
			} else {
				$('#iconeFavorito').attr('class', 'fas fa-star');
			}
		});
	}
}

if ($('#iconeFavorito').length > 0) {
	if ($('#idCurso').val() != '') {
		$.getJSON("/portal/getFavorito", { format: "json", idCurso: $('#tipoCurso').val() + '-' + $('#idCurso').val() }).done(function(data) {
			if (data.status == 0) {
				$('#iconeFavorito').attr('class', 'far fa-star');
			} else {
				$('#iconeFavorito').attr('class', 'fas fa-star');
			}
		});
	}
}

$('.btn-trocar').click(function() {
	$.getJSON("/portal/trocar-produto", { format: "json", idProduto: $(this).data('id') }).done(function(data) {
		if (data.status == 0) {
			alert(data.message);
			$('.btn-trocar').html(label22);
		} else {
			alert(data.message);
		}
	});
});

$('#btnCopyLink').click(function() {
	var copyText = document.getElementById("productLink");
	copyText.select();
	document.execCommand("copy");
});



$("#btnPrint").click(function() {
	var divToPrint = document.getElementById('dealPopupDescription');
	newWin = window.open("");
	newWin.document.write(divToPrint.outerHTML);
	newWin.print();
	newWin.close();
});

$("#btnConcordoContrato").click(function() {
	$.getJSON("/portal/setContratoPessoa", { format: "json", idContratoPadrao: $('#idContratoPadrao').val(), idAlunoMensalidade: $('#idContratoPadraoContrato').val() }).done(function(data) {
		$('#dealPopup').modal('hide');
	});
});

$('#btnTopico').click(function() {
	if ($('#divTopico').attr('class') == 'd-none') {
		$('#divTopico').removeClass('d-none')
		if ($('#divTopico').data('load') == 'N') {
			getTopicoPai();
			$('#divTopico').data('load', 'S');
		}
	} else {
		$('#divTopico').addClass('d-none')
	}
});

function getTopicoPai() {
	if ($('#divTopico').data('load') == 'N') {
		var contentHtml = $('#divTopico').html();
		$('#divTopico').html($('#divTopico').html() + '<span class="badge badge-warning badge-media">' + label01 + '...</span>');
		$.getJSON("/portal/getTopicoPai", { format: "json", token: $("#token").val() }).done(function(data) {

			contentHtml = contentHtml + '<div class="titulo"><h5 class="float-left">' + label23 + ':</h5><button type="button" class="close" id="btnCloseTopico" onclick="closeTopico()"><span aria-hidden="true">&times;</span></button></div>';
			contentHtml = contentHtml + '<ul class="list-group list-grup-topics">';
			for (var i = 0; i < data.listTopics.length; i++) {
				var comentario = '';
				if (data.listTopics[i].comentario != null && data.listTopics[i].comentario.length > 0) {
					comentario = '<span class="badge badge-primary badge-media badge-media-' + data.tipo + '">' + data.listTopics[i].comentario + '</span>';
				}
				contentHtml += '<li class="list-group-item item-tree clearfix" onclick="openTopic(event, this, \'' + data.token + '-' + data.listTopics[i].token + '\', \'I\', false)">' + data.listTopics[i].nome + '</li>';
			}
			contentHtml += '</ul>';

			$('#divTopico').html(contentHtml);
		});
	}
}

function closeTopico() {
	$('#divTopico').addClass('d-none');
}

function openMediaProximo() {
	var url = '/portal/media?token=' + $('#chaveProximo').val();
	$.ajax({
		url: url,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			$('#modalBodyMedia').html(data);
			
			if ($('.btnSidebarPrimaryPDFShowcaseClose').length) {
    			$('.btnSidebarPrimaryPDFShowcaseClose').trigger('click');
				$('.linkSidebarPrimaryClassListOpen').trigger('click');
			}

		}
	});
}

function openMediaAnterior() {
	var url = '/portal/media?token=' + $('#chaveAnterior').val();
	$.ajax({
		url: url,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			$('#modalBodyMedia').html(data);
			
			if ($('.btnSidebarPrimaryPDFShowcaseClose').length) {
    			$('.btnSidebarPrimaryPDFShowcaseClose').trigger('click');
				$('.linkSidebarPrimaryClassListOpen').trigger('click');
			}

		}
	});
}
$('#btnAvancar').click(function() {
	goNextClass();
});

function goNextClass() {
	sincronizarMediaRotina();
	openMediaProximo();
}

$('#btnRetroceder').click(function() {
	goPrevClass();
});

function goPrevClass() {
	sincronizarMediaRotina();
	openMediaAnterior();
}

$('#btnDuvida').click(function() {
	if ($('#divDuvida').attr('class') == 'd-none') {
		$('#divVideoMaterial').addClass('d-none');
		$('#divVideoMaterial').removeClass('col-md-3');
		$('#divVideoChat').addClass('d-none');
		$('#divVideoChat').removeClass('col-md-3');
		$('#divBlocoNota').addClass('d-none');
		$('#divBlocoNota').removeClass('col-md-3');
		$('#divDuvida').removeClass('d-none');
		$('#divDuvida').addClass('col-md-3');
		$('#divVideoVideo').removeClass('col-md-12');
		$('#divVideoVideo').addClass('col-md-9');
	} else {
		$('#divDuvida').addClass('d-none');
		$('#divDuvida').removeClass('col-md-3');
		$('#divVideoVideo').removeClass('col-md-9');
		$('#divVideoVideo').addClass('col-md-12');
	}
});

$('#btnAnotacoes').click(function() {
	if ($('#divBlocoNota').attr('class') == 'd-none') {
		$('#divVideoMaterial').addClass('d-none');
		$('#divVideoMaterial').removeClass('col-md-3');
		$('#divVideoChat').addClass('d-none');
		$('#divVideoChat').removeClass('col-md-3');
		$('#divDuvida').addClass('d-none');
		$('#divDuvida').removeClass('col-md-3');
		$('#divBlocoNota').removeClass('d-none');
		$('#divBlocoNota').addClass('col-md-3');
		$('#divVideoVideo').removeClass('col-md-12');
		$('#divVideoVideo').addClass('col-md-9');

		getBlocoNotas();
		$("#divBlocoNotaEnvio").hide();
		$("#divBlocoNotaLista").show();

	} else {
		$('#divBlocoNota').addClass('d-none');
		$('#divBlocoNota').removeClass('col-md-3');
		$('#divVideoVideo').removeClass('col-md-9');
		$('#divVideoVideo').addClass('col-md-12');
	}
});

function salvarBlocoNotas() {
	if (!$("#formBlocoNota").valid()) {
		return;
	}

	$("#idVideoBlocoNota").val($("#idVideo").val());
	if (typeof tempo !== 'undefined') $("#tempoBlocoNota").val(tempo);

	$.post("/portal/salvarBlocoNota", $("#formBlocoNota").serialize(), function(data) {
		if (data.status == 0) {
			$("#idBlocoNota").val(0);
			$("#idVideoBlocoNota").val(0);
			$("#tempoBlocoNota").val(0);
			$("#tituloBlocoNota").val('');
			$("#descricaoBlocoNota").val('');
			getBlocoNotas();
			$("#divBlocoNotaEnvio").hide();
			$("#divBlocoNotaLista").show();
		} else {
			alert(data.message);
		}
	}, 'json');
}

function getBlocoNotas() {
	$.getJSON("/portal/getBlocoNotas", { format: "json", idVideoBlocoNota: $("#idVideo").val() }).done(function(data) {
		$("#ulListaBlocoNotas").empty();
		for (var i = 0; i < data.length; i++) {
			var linha = '<li class="list-group-item">';
			linha += '<a href="javascript:getBlocoNota(' + data[i].id + ')" style="color:#000;text-decoration: none;"><b>' + data[i].titulo + '</b></a></br>';
			linha += data[i].descricao;
			linha += "</li>";
			$("#ulListaBlocoNotas").append(linha);
		}
	});
}

function showBlocoNotaLista() {
	$("#divBlocoNotaEnvio").hide();
	$("#divBlocoNotaLista").show();
}

function showBlocoNotaIncluir() {
	$("#divBlocoNotaLista").hide();
	$("#divBlocoNotaEnvio").show();
}

function getBlocoNota(id) {
	$.getJSON("/portal/getBlocoNota", { format: "json", id: id }).done(function(data) {
		$("#idBlocoNota").val(data.id);
		$("#idVideoBlocoNota").val(data.videoTO.id);
		$("#tempoBlocoNota").val(data.tempo);
		$("#tituloBlocoNota").val(data.titulo);
		$("#descricaoBlocoNota").val(data.descricao);
		showBlocoNotaIncluir();
	});
}

function setMediaFavorito() {
	if ($('#tipo').val() == 'V') {
		if ($('#idVideo').val() != '') {
			$.getJSON("/portal/setVideoFavorito", { format: "json", idVideo: $('#idVideo').val(), token: $('#token').val() }).done(function(data) {
				if (data.status == 0) {
					if ($('#iconeMediaFavorito').length > 0) $('#iconeMediaFavorito').prop('class', 'far fa-star');
					if ($('#iconeMediaFavorito4').length > 0) $('#iconeMediaFavorito4').removeAttr('checked');
					if ($('#iconeMediaFavorito4').length > 0) $('#iiconeMediaFavorito4').css('color', '#dedee6'); 
					if ($('#iconeMediaFavorito5').length > 0) $('#iconeMediaFavorito5').removeAttr('checked');
					if ($('#iiconeMediaFavorito5').length > 0) $('#iiconeMediaFavorito5').css('color', '#dedee6'); 
					if ($('#iconeMediaFavorito6').length > 0) $('#iconeMediaFavorito6').removeAttr('checked');
					if ($('#iiconeMediaFavorito6').length > 0) $('#iiconeMediaFavorito6').css("font-weight", "lighter"); 
				} else {
					if ($('#iconeMediaFavorito').length > 0) $('#iconeMediaFavorito').prop('class', 'fas fa-star');
					if ($('#iconeMediaFavorito4').length > 0) $('#iconeMediaFavorito4').prop('checked', 'checked');
					if ($('#iiconeMediaFavorito4').length > 0) $('#iiconeMediaFavorito4').css('color', '#fa0300');
					if ($('#iconeMediaFavorito5').length > 0) $('#iconeMediaFavorito5').prop('checked', 'checked');
					if ($('#iiconeMediaFavorito5').length > 0) $('#iiconeMediaFavorito5').css('color', '#fa0300');
					if ($('#iconeMediaFavorito6').length > 0) $('#iconeMediaFavorito6').prop('checked', 'checked');
					if ($('#iiconeMediaFavorito6').length > 0) $('#iiconeMediaFavorito6').css("font-weight", "bold"); 
					
				}
			});
		}
	} else if ($('#tipo').val() == 'D') {
		if ($('#idDocumento').val() != '') {
			$.getJSON("/portal/setDocumentoFavorito", { format: "json", idDocumento: $('#idDocumento').val(), token: $('#token').val() }).done(function(data) {
				if (data.status == 0) {
					if ($('#iconeMediaFavorito').length > 0) $('#iconeMediaFavorito').attr('class', 'far fa-star');
					if ($('#iconeMediaFavorito4').length > 0) $('#iconeMediaFavorito4').attr('checked', false);
					if ($('#iconeMediaFavorito6').length > 0) $('#iconeMediaFavorito6').attr('checked', false); 
					if ($('#iiconeMediaFavorito6').length > 0) $('#iiconeMediaFavorito6').css("font-weight", "lighter"); 
				} else {
					if ($('#iconeMediaFavorito').length > 0) $('#iconeMediaFavorito').attr('class', 'fas fa-star');
					if ($('#iconeMediaFavorito4').length > 0) $('#iconeMediaFavorito4').attr('checked', true); 
					if ($('#iconeMediaFavorito6').length > 0) $('#iconeMediaFavorito6').attr('checked', true); 
					if ($('#iiconeMediaFavorito6').length > 0) $('#iiconeMediaFavorito6').css("font-weight", "bold"); 
				}
			});
		}
	}
}


$('#star-rating').on('mouseover', 'i.fas.fa-star', function(event) {
	$(this).removeClass('star-unchecked').addClass('star-checked');
	$(this).prevAll().removeClass('star-unchecked').addClass('star-checked');
	$(this).nextAll().removeClass('star-checked').addClass('star-unchecked');
});

$('#star-rating').on('mouseleave', 'i.fas.fa-star', function(event) {
	active = $(this).parent().find('.selected');
	if (active.length) {
		active.removeClass('star-unchecked').addClass('star-checked');
		active.prevAll().removeClass('star-unchecked').addClass('star-checked');
		active.nextAll().removeClass('star-checked  ').addClass('star-unchecked');
	} else {
		$('#star-rating').find('.fas.fa-star').removeClass('star-checked').addClass('star-unchecked');
	}
});

$('#star-rating').on('click', 'i.fas.fa-star', function(event) {
	if ($(this).hasClass('selected')) {
		$(this).removeClass('selected');
		registraRating(0);
	} else {
		$('#star-rating').find('i').removeClass('selected');
		$(this).addClass('selected');
		registraRating($(this).data('rating'));
	}
});


function registraRating(classificacao) {
	
	if (typeof classificacao === "undefined") {
		return;
	}
	if ($('#tipo').val() == 'V') {
		$.getJSON("/portal/setVideoClassificacao", { format: "json", idVideo: $('#idVideo').val(), classificacao: classificacao }).done(function(data) { });
	} else if ($('#tipo').val() == 'D') {
		$.getJSON("/portal/setDocumentoClassificacao", { format: "json", idDocumento: $('#idDocumento').val(), classificacao: classificacao }).done(function(data) { });
	}
}

$("#palavraChaveCertificado").keyup(function() {
	$("#tableCertificate > tbody > tr").each(function() {
		if ($(this).text().toUpperCase().indexOf($('#palavraChaveCertificado').val().toUpperCase()) >= 0) {
			$(this).show();
		} else {
			$(this).hide();
		}
		if ($('#palavraChaveCertificado').val() == 0) {
			$(this).show();
		}
	});
});

function openPesquisaSatisfacao(url, chave, titulo) {
	$('#modalTitle').text(titulo)
	$('#modal1').modal('show');

	url = url + '?chave=' + chave;
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


function salvarPesquisa() {
	if (confirm(label37)) {
		$.post("/portal/salvarPesquisa", $("#pesquisaForm").serialize(), function(data) {
			alert('Obrigado por participar');
			$('#modal1').modal('hide');
			$('#modal1').hide();
			$('.modal-backdrop').hide();
			//location.reload();
		}, 'html');
	}
}

function sairPesquisa() {
	if (confirm(label25)) {
		$('#modal1').modal('hide');
		$('#modal1').hide();
		$('.modal-backdrop').hide();
	}
}

$('[name="btnViewContrato"]').click(function() {
	var idAlunoMensalidade = $(this).data('value');
	$.getJSON("/portal/getContratoPadrao", { format: "json", idAlunoMensalidade: idAlunoMensalidade }).done(function(data) {
		if (data == null) {
			alert(label26);
			return false;
		}

		for (var i = 0; i < data.length; i++) {
			var url = '/portal/contrato-print?idTipoContrato=' + data[i] + '&idAlunoMensalidade=' + idAlunoMensalidade;
			window.open(url, 'contrato' + data[i]);
		}
	});
});


$('#btnAutorizacaoPagSeguro').click(function() {
	$.getJSON("/portal/getAutorizacao", { format: "json" }).done(
		function(data) {
			if (data != null && data.status == 0) {
				window.open(data.message, '_blank');
			} else {
				alert(data.message);
			}
		});
});

function closeWindow() {
	if ($('#modalBodyMedia').length > 0 && $('#modalBodyMedia').html() !== undefined && $('#modalBodyMedia').html().indexOf('iframeBoletim') == -1) {
		$('#modalBodyMedia').html('');
	} else {
		$('#iframeBoletim').attr('src', '');
	}
	$('#modal1').modal('hide');
}

function loadForum() {
	$('#modalFooter1').show();
	$('#modalDialog1').width('100%');
	$('#modalDialog1').height('auto');
	$('#btnMaterial').hide();
	$('#btnChat').hide();
	$('#btnDownload').hide();
	$('#btnDownloadTrilha').hide();
	$('#divClassificacao').hide();
	$('#divClassificacao').attr("style", "display: none !important");
	$('#btnFavoritos').hide();
	$('#btnAnotacoes').hide();
	$('#btnAnotacoes').attr("style", "display: none !important");
	$('#btnDuvida').hide();
	$('#modalDialog1').css('max-width', '100%');
	$('.modal-content').css('background-color', '#FFFFFF');

	var heightCompoment = $(window).height() - 110;
	if ($('#modalBodyMedia').height() < 100) {
		if ($('#modalContent').height() > 100) {
			heightCompoment = $('#modalContent').height();
		}
	} else {
		heightCompoment = $('#modalBodyMedia').height();
	}
	$('#modalBodyMedia').height(heightCompoment)
	$('#modalBodyMedia').css('overflowY', 'auto');
}

function calculaCriterio(id, valor) {
	var pontos = $('#pontoCriterioMax' + id).val();
	$('#pontoCriterio' + id).val((pontos * valor) / 100);
	$('#badgePontos' + id).html(float2moeda2($('#pontoCriterio' + id).val()) + '/' + float2moeda2($('#pontoCriterioMax' + id).val()));

	if (valor < 40) {
		$('#badgePontos' + id).attr('class', 'badge badge-pill badge-danger w-100 mt-2');
	} else if (valor < 80) {
		$('#badgePontos' + id).attr('class', 'badge badge-pill badge-primary w-100 mt-2');
	} else {
		$('#badgePontos' + id).attr('class', 'badge badge-pill badge-success w-100 mt-2');
	}
	calculaCriterioTotal();
}

function calculaCriterioTotal() {
	var pontoCriterioMax = 0.0;
	$('[data-ponto-criterio-max="true"]').each(function(index) {
		if ($(this).val() != null && $(this).val().length > 0) {
			pontoCriterioMax += parseFloat($(this).val());
		}
	});
	var total = 0.0;
	$('[data-ponto-criterio="true"]').each(function(index) {
		if ($(this).val() != null && $(this).val().length > 0) {
			total += parseFloat($(this).val());
		}
	});
	var notaCorrecao = moeda2float($('#notaMax').val()) * (total / pontoCriterioMax);
	$('#notaCorrecao').val(float2moeda(notaCorrecao));
}


$("#divDocument").dblclick(function(e) {
	e.preventDefault();
	var x = e.pageX - $("#divDocument").offset().left;
	var y = e.pageY - $("#divDocument").offset().top - 10;
	$('#flagId').val(0);
	$('#flagTop').val(y);
	$('#flagLeft').val(x);
	tinymce.get("flagComentario").setContent("");
    setTimeout(function() {
		tinymce.editors[0].focus();
    }, 1000);
	$('#flagWidth').val(getWidth());
	$('#flagHeight').val(getHeight());
	criarIcone('0', y, x, getWidth(), getHeight(), '', getCor());
	$('#modalComentario').modal({ backdrop: 'static', keyboard: false });
})

function criarIcone(id, top, left, width, height, comentario, cor) {
	var icon = $('<i class="fas fa-circle flag-comentario"></i>');
	icon.attr('id', 'flag' + id);
	icon.css('top', top);
	icon.css('left', left);
	icon.css('z-index', 10);
	icon.data('id', id);
	icon.data('flag', true);
	icon.data('comentario', comentario);
	icon.data('top', top);
	icon.data('left', left);
	icon.data('width', width);
	icon.data('height', height);
	icon.css('cursor', 'pointer');
	icon.css('position', 'absolute');
	icon.css('font-size', '19px');
	icon.css('opacity', '0.5');
	icon.css('color', cor);
	icon.appendTo('#divDocument');

	if (comentario != '') {
		icon.data('toggle', 'tooltip');
		icon.data('placement', 'auto');
		icon.attr('data-html', 'true');
		icon.attr('title', comentario);
		icon.tooltip({ boundary: 'window'});		
		
		$('#flag' + id).on('inserted.bs.tooltip', function() {
			document.querySelectorAll('.tooltip-inner').forEach((tooltip) => {
				tooltip.style.backgroundColor = "#fff";
				tooltip.style.color = "#000";
				tooltip.style.border = "2px solid #ccc";
				tooltip.style.maxWidth = "900px";
			});
		})
	}


	icon.click(function() {
		openComentarios($(this).data('id'));
	});
}

function openComentarios(id) {
	var icon = $('#flag' + id);
	$('#flagId').val(id);
	$('#flagTop').val(icon.data('top'));
	$('#flagLeft').val(icon.data('left'));
	$('#flagWidth').val(icon.data('width'));
	$('#flagHeight').val(icon.data('height'));
	if ($('#textoComentario').length > 0) $('#textoComentario').html(icon.data('comentario')); 
	if (document.getElementById('flagComentario')) {
		tinymce.get('flagComentario').setContent(icon.data('comentario'));
	    setTimeout(function() {
			tinymce.editors[0].focus();
	    }, 1000);
	} else {
		$('#flagComentario').val(icon.data('comentario'));
	}
	$('#modalComentario').modal('show');
}

function fecharModalComentario() {
  $('#modalComentario').modal('hide');
}

$('#btnSalvarFlag').click(function() {
	const content = tinymce.get("flagComentario").getContent();

	if (content.length == 0) {
		alert('Preencha um comentário.');
		return;
	}

	var cor = getCor();

	$.post("/portal/salvarFlagComentario", {
		id: $("#flagId").val(),
		idAvaliacaoAluno: $("#idAvaliacaoAluno").val(),
		comentario: content,
		topo: Math.round($("#flagTop").val()),
		esquerda: Math.round($("#flagLeft").val()),
		largura: Math.round($("#flagWidth").val()),
		altura: Math.round($("#flagHeight").val()),
		tipo: 1,
		topo2: 0,
		esquerda2: 0,
		cor: cor
	}, function(data) {
		if (data.status == 0) {
			if ($('#flag' + data.message).length == 0) {
				var icon = $('#flag0');
				icon.attr('id', 'flag' + data.message);
				icon.data('original-title', content);
				icon.data('id', data.message);
				icon.data('comentario', content);
				icon.data('html', true);
				icon.data('toggle', 'tooltip');
				icon.data('placement', 'auto');
				icon.attr('data-html', 'true');
				icon.attr('title', content);
				icon.tooltip({ boundary: 'window'});		

				$('#flag' + data.message).on('inserted.bs.tooltip', function() {
					document.querySelectorAll('.tooltip-inner').forEach((tooltip) => {
					tooltip.style.backgroundColor = "#fff";
					tooltip.style.color = "#000";
					tooltip.style.border = "2px solid #ccc";
					tooltip.style.maxWidth = "900px";
					});
				})

			} else {
				var icon = $('#flag' + data.message);
				icon.tooltip('dispose');
				icon.attr('data-html', 'true');
				icon.attr('data-original-title', content);
				icon.attr('title', content);
				icon.data('comentario', content)
				icon.tooltip();
			}
			$('#flagId').val(0);
			$('#flagTop').val('');
			$('#flagLeft').val('');
			$('#flagWidth').val('');
			$('#flagHeight').val('');
			$('#flagComentario').val('');
		} else {
			alert(data.message);
		}
		$('#modalComentario').modal('hide');
	}, 'json');
});


$('#btnApagarFlag').click(function() {
	icon = $('#flag' + $('#flagId').val());
	icon.remove();
	if ($('#flagId').val() > 0) {
		$.post("/portal/apagarFlagComentario", { id: $("#flagId").val() }, function(data) {
			$('#modalComentario').modal('hide');
		}, 'json');
	} else {
		$('#modalComentario').modal('hide');
	}
});

function paginationDocument(indice) {
	$('#indice').val(indice);
	$('#filterDocuments').click();
}

// Arguments :
//  verb : 'GET'|'POST'
//  target : an optional opening target (a name, or "_blank"), defaults to "_self"
window.io = {
	open: function(verb, url, data, target) {
		var form = document.createElement("form");
		form.action = url;
		form.method = verb;
		form.target = target || "_self";
		if (data) {
			for (var key in data) {
				var input = document.createElement("input");
				input.name = key;
				input.value = typeof data[key] === "object"
					? JSON.stringify(data[key])
					: data[key];
				form.appendChild(input);
			}
		}
		form.style.display = 'none';
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	}
};


$('[name="btnAgendar"]').click(function() {
	var start = $(this).data('start');
	var end = $(this).data('end');
	var host = $(this).data('host');
	var id = $(this).data('id');
	var url = $(this).data('url');

	io.open('POST', url, { start: start, end: end, host: host, id: id });

});

function getContentTopic(event, id) {
	$.getJSON("/portal/getContentTopic", { format: "json", id: id }).done(function(data) {
		if (data != null && data.status == 0) {
			$('#modal2').modal('show');
			$('#modalContentTopic').html(data.message);
		} else {
			alert(data.message);
		}
	});
	event.stopPropagation();
}

function getCompleteDate() {
	var date = new Date();
	return date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
}

function diffHours(hora1, hora2) {
	
	if (hora1 == null || hora2 == null) return 0;
	
	var min1 = hora1.substring(10, 12);
	var seg1 = hora1.substring(12, 14);

	var min2 = hora2.substring(10, 12);
	var seg2 = hora2.substring(12, 14);

	return ((min1 - min2) * 60) + (seg1 - seg2);
}

function openStudos(titulo) {

	var dialog = BootstrapDialog.show({
		title: 'Aguarde...',
		message: 'Aguarde estamos abrindo a ' + titulo + '!',
		buttons: [
			{
				id: 'btn-ok',
				icon: 'glyphicon glyphicon-check',
				label: 'Fechar',
				cssClass: 'btn-primary',
				data: { js: 'btn-confirm', 'user-id': '3' },
				autospin: false,
				action: function(dialogRef) { dialogRef.close(); }
			}]
	});

	$.getJSON("/portal/studos", { format: "json" }).done(function(data) {
		if (data != null) {
			if (data.status == true && data.url != '') {
				var link = document.createElement('a');
				link.target = '_blank';
				link.href = data.url;
				document.body.appendChild(link);
				link.click();
				setTimeout(BootstrapDialog.closeAll, 2000);
			} else {
				if (data.mensagem != '') {
					dialog.setMessage(data.mensagem);
					dialog.setTitle('Atenção!');
				}
			}
		} else {
			dialog.setMessage('Erro ao abrir');
			dialog.setTitle('Atenção!');
		}
	});
}


$('[name="btnIncluirDocumentoAluno"]').click(function() {
	$("#tipoDocumento").val('');
	$("#tipoDocumento").prop('disabled', '');
	$('#documentosPopup').modal('show');
	$("#idDocumentoAluno").val(0);
});

$('[name="btnDownloadDocumentoAluno"]').click(function() {
	window.open('/portal/documento-aluno-download?id=' + $(this).data('value'), '_self');
});

$('[name="btnAlterarDocumentoAluno"]').click(function() {
	$.getJSON("/portal/getDocumentoAluno", { format: "json", id: $(this).data('value') }).done(function(data) {
		if (data != null) {
			$("#idDocumentoAluno").val(data.idDocumentoAluno);
			$("#tipoDocumento").val(data.idTipoDocumento);
			$("#tipoDocumento").prop('disabled', 'disabled');
			$("#tipoDocumento").val(data.idTipoDocumento);
			$('#documentosPopup').modal('show');
		}
	});
});

$('#fileUploadTipoDocumentoAluno').change(function(event) {
	var files = event.target.files;
	if ($("#btnSalvarDocumentoAluno").length) $('#btnSalvarDocumentoAluno').prop('disabled', true);
	receberVariosArquivos(files, $(this).data('type'), $(this).data('id'), $(this).data('directory'), null, false);
});

$('.fileUploadTipoDocumento').change(function(event) {
	var files = event.target.files;
	receberVariosArquivos(files, $(this).data('type'), $(this).data('id'), $(this).data('directory'), $(this).attr('name') + '_temp', false);
});

$('.fileUpload').change(function(event) {
	var files = event.target.files;
	receberVariosArquivos(files, $(this).data('type'), $(this).data('id'), $(this).data('directory'), null, $(this).data('delete'));
});


$('#btnSalvarDocumentoAluno').click(function() {
	if ($("#tipoDocumento").val().length == 0) {
		alert('Preencha o Tipo de Documento.');
		return;
	}
	$.post("/portal/salvarDocumentoAluno", { id: $("#idDocumentoAluno").val(), idTipoDocumento: $("#tipoDocumento").val() }, function(data) {
		if (data.status == 0) {
			alert(data.message);
			location.reload();
		} else {
			alert(data.message);
		}
	}, 'json');
});

$('[name="btnExcluirDocumentoAluno"]').click(function() {
	if (confirm(label27)) {
		$.post("/portal/excluirDocumentoAluno", { id: $(this).data('value') }, function(data) {
			if (data.status == 0) {
				alert(data.message);
				location.reload();
			} else {
				alert(data.message);
			}
		}, 'json');
	}
});

function openModalTeacher(opcao) {
	if (opcao == 1) {
		$('#iFrameDocument').addClass('d-none')
		$('#divDocument').addClass('d-none')
		$('#modalBodyMedia').removeClass('d-none');
	} else {
		$('#modalBodyMedia').addClass('d-none')
		$('#iFrameDocument').removeClass('d-none');
		$('#divDocument').removeClass('d-none');
	}
}


$('[name="btnInscreveAlunos"]').click(function() {

	var quantidade = $(this).data('quantidade');
	var idContrato = $(this).data('contrato');
	var idCurso = $(this).data('curso');
	var tipoCurso = $(this).data('tipo');

	var conteudo = '';
	conteudo += '<input type="hidden" name="idContrato" id="idContrato" value="' + idContrato + '">';
	conteudo += '<input type="hidden" name="idCurso" id="idCurso" value="' + idCurso + '">';
	conteudo += '<input type="hidden" name="tipoCurso" id="tipoCurso" value="' + tipoCurso + '">';
	conteudo += '<input type="hidden" name="quantidade" id="quantidade" value="' + quantidade + '">';

	for (var i = 1; i <= quantidade; ++i) {
		conteudo += '<div class="row m-2">';
		conteudo += '<div class="col-sm-12 col-md-6"><div class="form-group"><label class="control-label">Nome ' + i + '</label><input type="text" name="nome' + i + '" id="nome' + i + '" value="" maxlength="50" class="form-control" data-validation="required length" data-validation-length="max50"></div></div>';
		conteudo += '<div class="col-sm-12 col-md-6"><div class="form-group"><label class="control-label">E-mail ' + i + '</label><input type="text" name="email' + i + '" id="email' + i + '" value="" maxlength="250" class="form-control" data-validation="required length email" data-validation-length="max250"></div></div>';
		conteudo += '</div>';
	}
	$('#inscreverAlunosForm').html(conteudo);
	$('#inscricaoPopup').modal('show');
});

$('#btnSalvarInscrever').click(function() {
	if (!$("#inscreverAlunosForm").valid()) {
		return;
	}
	$.post("/portal/inscreverAlunosContrato", $("#inscreverAlunosForm").serialize(), function(data) {
		$('#inscricaoPopup').modal('hide');
		location.reload();
	}, 'json');
});

function downloadArquivo(idButton) {

	$('#' + idButton).prop("disabled", "true");
	$("#modalLoading").modal({
		backdrop: "static",
		keyboard: false,
		show: true
	});
	var id = $('#' + idButton).data('value');
	var token = $('#' + idButton).data('token');

	var path = $('#' + idButton).data('path');
	var posicao = $('#' + idButton).data('posicao');
	if (path.toLowerCase().substr(-3) != 'pdf') posicao = 0;

	gerarPDFStamper(posicao, id, 'D', token, idButton, 'modalLoading', null, false);
}

$('[name="btnContratoCancelamento"]').click(function() {

	if (confirm(label28) == true) {
		var idContrato = $(this).data('contrato');
		var url = '/portal/contrato-cancelamento?id=' + idContrato;
		$.getJSON(url, { format: "json" }).done(function(data) {
			if (data.status == 0) {
				alert(label29);
				location.reload();
			} else {
				alert(data.message);
			}
		});
	}
});


$('[name="btnViewDeclaracao"]').click(function() {

	$('#situacao').val($(this).data('situacao'));
	$('#token').val($(this).data('token'));

	$.getJSON("/portal/getDeclaracoes", { format: "json", situacaoContrato: $(this).data('situacao'), idAlunoMensalidade: $(this).data('contrato')  }).done(function(data) {

		$('#listaDeclaracoes').html('');
		linhaHtml = '<div class="row">';
		for (var i = 0; i < data.length; i++) {
			if (data[i].liberadaPortal == 'S') {
				var url = '/portal/contratoPadrao?id=' + data[i].id;
				url += '&token=' + $('#token').val();
				linhaHtml += '<div class="col-xs-12 col-sm-6 col-md-4"><div class="thumbnail">';
				linhaHtml += '    <div class="caption text-center">';
				linhaHtml += '        <p>' + data[i].nome + '</p>';
				linhaHtml += '        <a href="javascript:window.open(\'' + url + '\',\'declaracao' + data[i].id + '\')" class="btn btn-primary center-block" role="button">' + label30 + '</a>';
				linhaHtml += '    </div>';
				linhaHtml += '</div></div>';
			}
		}
		linhaHtml += '</div>';
		$('#listaDeclaracoes').append(linhaHtml);

	});

	$('#declaracaoPopup').modal('show');
});

function rotate90deg() {
    $.ajax({
        url: '/portal/rotacionarImagemAvaliacao',
        type: 'POST',
        dataType: 'json',
        data: {
            idAvaliacaoAluno: $('#idAvaliacaoAluno').val()
        },
        beforeSend: function() {
            $('#btnRotacionar').prop('disabled', true);
        },
        success: function(data) {
            if (data.status == 0) {
                var img = $('#img-viewer');
                var srcAtual = img.attr('src');

                // Remove cache-bust anterior se existir, mantém parâmetros originais
                var srcLimpo = srcAtual.replace(/&t=\d+/, '').replace(/\?t=\d+/, '');

                // Adiciona novo cache-bust mantendo os parâmetros originais
                var separador = srcLimpo.indexOf('?') >= 0 ? '&' : '?';
                img.attr('src', srcLimpo + separador + 't=' + new Date().getTime());

                img.off('load').on('load', function() {
                    carregarCorrecao();
                    $('#btnRotacionar').prop('disabled', false);
                });
            } else {
                alert(data.message);
                $('#btnRotacionar').prop('disabled', false);
            }
        },
        error: function(xhr, status, error) {
            alert('Erro ao rotacionar a imagem: ' + error);
            $('#btnRotacionar').prop('disabled', false);
        }
    });
}

function zoom(e) {
	var zoomer = e.currentTarget;
	e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX
	e.offsetY ? offsetY = e.offsetY : offsetX = e.touches[0].pageX
	x = offsetX / zoomer.offsetWidth * 100
	y = offsetY / zoomer.offsetHeight * 100
	zoomer.style.backgroundPosition = x + '% ' + y + '%';
}

function previewImage() {
	const input = document.querySelector('#fileUpload');
	const preview = document.querySelector('#preview');

	let divPreview = document.querySelector('#divPreview');

	if (input.files[0].type == "application/pdf") {
		if (!divPreview) {
			divPreview = document.createElement('div');
			divPreview.setAttribute('id', 'divPreview');
		}
		preview.src = "";
		preview.insertAdjacentElement('afterend', divPreview);
		gerarPDF('divPreview', URL.createObjectURL(input.files[0]), 0, 0, null);
	} else {
		preview.style.display = '';
		if (divPreview) divPreview.remove();
		preview.src = URL.createObjectURL(input.files[0]);
	}
}

function getMaxVistoFormatado(maxVistoFormatado, maxVisto) {
	if (maxVistoFormatado == 1) {
		return label34;
	} else if (maxVistoFormatado == 2) {
		return label33 + ": " + maxVisto + " " + label36;
	} else {
		return label32;
	}
}

$(".collapse").on('show.bs.collapse', function(e) {
	if ($(this).is(e.target)) {
		getDiagrams($('#' + this.id).data('token'));
	}
})

function getDiagrams(tokenTopico) {
	if (tokenTopico == '' || tokenTopico == null) return;

	$.post("/portal/getDiagrams", { tokenTopico: tokenTopico }, function(data) {
		$("#cardBody" + tokenTopico).html('');
		var html = '';
		for (var i = 0; i < data.length; i++) {
			html += '<li class="list-group-item">';
			html += '   <i class="fas fa-project-diagram pr-2 media-class mouse-pointer" onclick="window.open(\'/portal/diagrama/' + data[i].token + '\', \'_self\')"></i>';
			html += '	<span onclick="window.open(\'/portal/diagrama/' + data[i].tokenTopico + '/' + data[i].token + '\', \'_self\')" class="mouse-pointer">' + data[i].nome + '</span>';
			if (data[i].delete == true) {
				html += '<i class="far fa-trash-alt float-right mouse-pointer pt-2 pr-3" onclick="deleteDiagram(\'' + data[i].token + '\', \'' + data[i].tokenTopico + '\');"></i>';
			}
			html += '</li>';
		}
		$("#cardBody" + tokenTopico).html(html);
	}, 'json');
}

function incluirNovoTopicoDiagram(tokenTopico) {
	window.open('/portal/diagrama/' + tokenTopico, '_self');

}

function incluirNovoTopico() {

	$('#modalDiagramsEdit').modal('show');
}

function salvarTopicoDiagrama() {
	$.post("/portal/salvarTopicoDiagram", { tokenTopico: $("#tokenTopico").val(), nome: $("#nomeTopico").val(), privacidade: $("#privacidade").val() }, function(data) {
		if (data != null) {
			window.location.reload();
		}
	}, 'json');
}

function alterarTopicoDiagram(tokenTopico) {
	$.post("/portal/getTopicoDiagram", { tokenTopico: tokenTopico }, function(data) {
		$('#tokenTopico').val(data.token);
		$('#nomeTopico').val(data.nome);
		$('#privacidade').val(data.privacidade);
	}, 'json');
	$('#modalDiagramsEdit').modal('show')
}

function deleteTopicoDiagram(tokenTopico) {
	if (confirm('Tem certeza que deseja deletar o tópico e todos os seus diagramas?') == true) {
		$.post("/portal/deleteTopicoDiagram", { tokenTopico: tokenTopico }, function(data) {
			if (data != null) {
				window.location.reload();
			}
		}, 'json');
	}
}

function deleteDiagram(tokenDiagrama, tokenTopico) {
	if (confirm('Tem certeza que deseja deletar o diagrama?') == true) {
		$.post("/portal/deleteDiagram", { tokenDiagrama: tokenDiagrama }, function(data) {
			if (data != null) {
				getDiagrams(tokenTopico);
			}
		}, 'json');
	}
}

function deleteTopicoFlashCard(tokenTopico) {
	if (confirm('Tem certeza que deseja deletar o tópico, todos os seus cards e ações?') == true) {
		$.post("/portal/deleteTopicoFlashCard", { tokenTopico: tokenTopico }, function(data) {
			if (data != null) {
				window.location.reload();
			}
		}, 'json');
	}
}

// Variáveis globais para o desenho
var isDrawing = false;
var drawStartX = 0;
var drawStartY = 0;
var previewLineId = 'linha-preview';

// SUBSTITUA a função habilitarLinha() existente por esta:
function habilitarLinha() {
    if ($('#btnLinha').data('habilitado') == 1) {
        // Desabilitar
        $('#btnLinha').data('habilitado', 0);
        $('#btnLinha').css('background-color', 'unset');
        $('#divDocument').css('cursor', 'default');
        removerEventosDesenho();
        removerLinhaPreview();
    } else {
        // Habilitar
        $('#btnLinha').data('habilitado', 1);
        $('#btnLinha').css('background-color', '#CCCCCC');
        $('#divDocument').css('cursor', 'crosshair');
        configurarEventosDesenho();
    }
}

function criarLinha(id, x1, y1, x2, y2, color) {

	if ($('#svglinha').length == 0) {
		var svg = '<svg xmlns="http://www.w3.org/2000/svg" id="svglinha" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="' + getWidth() + '" height="' + getHeight() + '" style="position: absolute;top: 0;"></svg>';
		if ($('#divDocument img').length > 0) {
			$('#divDocument').append(svg);
		} else {
			$('#divDocument2').append(svg);
		}
	}

	var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	newLine.setAttribute('id', 'linha' + id);
	newLine.setAttribute('x1', x1);
	newLine.setAttribute('y1', y1);
	newLine.setAttribute('x2', x2);
	newLine.setAttribute('y2', y2);
	newLine.setAttribute('stroke-linecap', "round");
	newLine.setAttribute('stroke-opacity', "0.7");
	newLine.setAttribute('stroke-width', "8");
	newLine.setAttribute('stroke', color);
	newLine.setAttribute('class', "linhaCorrecao");
	$("#svglinha").append(newLine);
}

function getCor() {
	const rgb2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`;
	
	for (var i = 1; i <= 5; i++) {
		if ($('#btnCor' + i).data('marcado') == 1) {
			return rgb2hex($('#btnCor' + i).css("background-color"));
		}
	}
}

function habilitarCor(indice) { 
	for (var i = 1; i <= 5; i++) {
		$('#btnCor' + i).data('marcado', '0');
		$('#btnCor' + i).css("color", '#FFFFFF');
	}
	$('#btnCor' + indice).data('marcado', '1');
	$('#btnCor' + indice).css("color", '#000000');
}

function magnify(imgID, zoom, create) {

	if (create) {
		var img, glass, w, h, bw;
		img = document.getElementById(imgID);

		glass = document.createElement("DIV");
		glass.setAttribute("class", "img-magnifier-glass");

		img.parentElement.insertBefore(glass, img);

		glass.style.backgroundImage = "url('" + img.src + "')";
		glass.style.backgroundRepeat = "no-repeat";
		glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
		glass.style.zIndex = "5";
		bw = 3;
		w = glass.offsetWidth / 2;
		h = glass.offsetHeight / 2;

		glass.addEventListener("mousemove", moveMagnifier1);
		img.addEventListener("mousemove", moveMagnifier1);

		glass.addEventListener("touchmove", moveMagnifier1);
		img.addEventListener("touchmove", moveMagnifier1);
		function moveMagnifier1(e) {
			var pos, x, y;
			e.preventDefault();
			pos = getCursorPos1(e);
			x = pos.x;
			y = pos.y;
			if (x > img.width - (w / zoom)) { x = img.width - (w / zoom); }
			if (x < w / zoom) { x = w / zoom; }
			if (y > img.height - (h / zoom)) { y = img.height - (h / zoom); }
			if (y < h / zoom) { y = h / zoom; }
			glass.style.left = (x - w) + "px";
			glass.style.top = (y - h) + "px";
			glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
		}

		function getCursorPos1(e) {
			var a, x = 0, y = 0;
			e = e || window.event;
			a = img.getBoundingClientRect();
			x = e.pageX - a.left;
			y = e.pageY - a.top;
			x = x - window.pageXOffset;
			y = y - window.pageYOffset;
			return { x: x, y: y };
		}
	} else {
		document.querySelector('.img-magnifier-glass').remove();
	}
}

function magnifyDiv(containerID, zoom, create) {
    if (create) {
        var container = document.getElementById(containerID);
        var wrapper = container.parentElement;
        
        // Cria a lupa
        var glass = document.createElement("DIV");
        glass.setAttribute("class", "img-magnifier-glass2");
        wrapper.appendChild(glass);
        var w = 120; // Largura da lupa
        var h = 120; // Altura da lupa
        glass.style.width = w + "px";
        glass.style.height = h + "px";

        function moveMagnifier(e) {
            e.preventDefault();
            
            // Obtém as coordenadas do cursor relativas ao contêiner
            var rect = container.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;

            // Limita o cursor dentro dos limites do contêiner
            x = Math.max(0, Math.min(x, container.offsetWidth));
            y = Math.max(0, Math.min(y, container.offsetHeight));

            // Ajusta a posição da lupa
            glass.style.left = (x - w / 2) + "px";
            glass.style.top = (y - h / 2) + "px";

            // Captura o conteúdo atual do contêiner em um canvas temporário
            var dataUrl = getCanvasDataURL(container);
            glass.style.backgroundImage = "url('" + dataUrl + "')";

            // Define o tamanho do background ampliado
            var bgWidth = container.offsetWidth * zoom;
            var bgHeight = container.offsetHeight * zoom;
            glass.style.backgroundSize = bgWidth + "px " + bgHeight + "px";

            // Calcula a posição do background dentro da lupa
            var offsetX = x * zoom * 1;
            var offsetY = y * zoom * 1;

            // Centraliza o conteúdo da lupa
            var centerOffsetX = w / 2;
            var centerOffsetY = h / 2;

            // Define a posição do background
            glass.style.backgroundPosition = "-" + (offsetX - centerOffsetX) + "px -" + 
                                             (offsetY - centerOffsetY) + "px";
        }

        function getCanvasDataURL(container) {
            var tempCanvas = document.createElement("canvas");
            tempCanvas.width = container.offsetWidth * 1.4;
            tempCanvas.height = container.offsetHeight * 1.4;
            var ctx = tempCanvas.getContext("2d");

            // Desenha todos os canvases no canvas temporário
            var canvases = container.querySelectorAll("canvas");
            canvases.forEach(canvas => {
                ctx.drawImage(canvas, canvas.offsetLeft, canvas.offsetTop * 1.4, 
                            canvas.width, canvas.height);
            });

            return tempCanvas.toDataURL();
        }

        // Adiciona os eventos de movimento
        container.addEventListener("mousemove", moveMagnifier);
        container.addEventListener("touchmove", moveMagnifier);
        
    } else {
        var glass = document.querySelector('.img-magnifier-glass2');
        if (glass) {
            glass.remove();
        }
    }
}
function toggleLupa() {
	const lupa = document.getElementById('lupa');
	if (lupa.classList.contains('ativada')) {
		lupa.classList.remove('ativada');
		
		if ($('#img-viewer').length == 0) {
			magnifyDiv("divDocument2", 2, false); 		
		} else {			
			magnify("img-viewer", 2, false);
		}
	} else {
		lupa.classList.add('ativada');
		if ($('#img-viewer').length == 0) {
			magnifyDiv("divDocument2", 2, true); 		
		} else {			
			magnify("img-viewer", 2, true);
		}
	}
}


function getWidth() {
	if ($("#divDocument img").length > 0) {
		return Math.round($("#divDocument img").width());
	} else if ($("#divDocument canvas").length > 0) {
		return Math.round($('#divDocument canvas').width());
	}
}

function getHeight() {
	if ($("#divDocument img").length > 0) {
		return Math.round($("#divDocument img").height());
	} else if ($("#divDocument canvas").length > 0) {
		return Math.round($('#divDocument canvas').height());
	}
}


function addOption(theSel, theText, theValue) {
	var newOpt = new Option(theText, theValue);
	var selLength = theSel.length;
	theSel.options[selLength] = newOpt;
}

function deleteOption(theSel, theIndex) {
	var selLength = theSel.length;
	if (selLength > 0) {
		theSel.options[theIndex] = null;
	}
}

function moveOptions(theSelFrom, theSelTo) {

	var selLength = theSelFrom.length;
	var selectedText = new Array();
	var selectedValues = new Array();
	var selectedCount = 0;

	var i;

	for (i = selLength - 1; i >= 0; i--) {
		if (theSelFrom.options[i].selected) {
			selectedText[selectedCount] = theSelFrom.options[i].text;
			selectedValues[selectedCount] = theSelFrom.options[i].value;
			deleteOption(theSelFrom, i);
			selectedCount++;
		}
	}

	for (i = selectedCount - 1; i >= 0; i--) {
		addOption(theSelTo, selectedText[i], selectedValues[i]);
	}
}

// Seleciona todos os itens de uma lista
function SelecionarTodosItens(Lista) {
	for (var i = 0; i < Lista.options.length; i = i + 1) {
		Lista.options[i].selected = true;
	}
}

function verifyOne(theSelFrom, theSelTo) {
	var selLength = theSelTo.length;
	var index = -1;
	for (i = selLength - 1; i >= 0; i--) {
		if (theSelTo.options[i].value.substring(0, 1) == 1) {
			index = i;
		}
	}

	if (index >= 0) {
		var selectedText = new Array();
		var selectedValues = new Array();
		var selectedCount = 0;

		for (i = selLength - 1; i >= 0; i--) {
			if (index != i) {
				selectedText[selectedCount] = theSelTo.options[i].text;
				selectedValues[selectedCount] = theSelTo.options[i].value;
				deleteOption(theSelTo, i);
				selectedCount++;
			}
		}
		for (i = selectedCount - 1; i >= 0; i--) {
			addOption(theSelFrom, selectedText[i], selectedValues[i]);
		}
	}
}

function checkCursosPlanoEstudo(valueCheckBox) {

	if (!$("#planoEstudoForm").valid()) {
		return;
	}

	var checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
	var valueCheckBox = "";

	for (const item of checkedBoxes) {
		valueCheckBox = valueCheckBox + item.value + '-';
	}

	var inputCheck = document.getElementById("valueCheckBox");
	inputCheck.value = valueCheckBox;

	var cursos = document.getElementById('idCursoSelecionada').options;
	var idCursos = "";

	for (const item2 of cursos) {
		idCursos = idCursos + item2.value + '-';
	}
	var inputCursos = document.getElementById("valueCurso");
	inputCursos.value = idCursos;

	var inputData = document.getElementById("valueDate");
	inputData.value = document.getElementById("datepicker").value

	SelecionarTodosItens(document.getElementById('idCursoSelecionada'));

	$.post("/portal/enviarCursosPlanoEstudo", $("#planoEstudoForm").serialize(), function(data) {

		var idPE = document.getElementById("idPlanoEstudo");

		select = document.getElementById('idTopicoNaoSelecionada');
		removeOptions(select);
		removeOptions(document.getElementById('idTopicoSelecionada'));

		for (const item of data) {
			idPE.value = item.idPlanoEstudo;
			if (item.nome != null) {
				for (const item2 of item.listaTopico) {
					var opt = document.createElement('option');
					opt.value = item2.id;
					opt.innerHTML = item.nome + ' | ' + item2.nome;
					select.appendChild(opt);
				}
			}
		}
		returnTab(3);
	}, 'json');
};

function checkTopicosPlanoEstudo() {

	if (!$("#planoEstudoForm").valid()) {
		return;
	}

	var numTo = document.getElementById('nroTopicos');
	var numAu = document.getElementById('nroAulas');

	var inputTo = document.getElementById("nrTopicos")
	var inputAu = document.getElementById("nrAulas")

	numTo.value = inputTo.value
	numAu.value = inputAu.value

	var topicos = document.getElementById('idTopicoSelecionada').options;
	var idTopicos = "";

	for (const item2 of topicos) {
		idTopicos = idTopicos + item2.value + '-';
	}
	var inputTopicos = document.getElementById("valueTopico");
	inputTopicos.value = idTopicos;

	SelecionarTodosItens(document.getElementById('idTopicoSelecionada'));

	$.post("/portal/enviarTopicosPlanoEstudo", $("#planoEstudoForm").serialize(), function() {
		window.location.replace("agenda")
	}, 'json');
};

function removeOptions(selectElement) {
	var i, L = selectElement.options.length - 1;
	for (i = L; i >= 0; i--) {
		selectElement.remove(i);
	}
}

function returnTab(index) {

	var tab1 = document.getElementById("disponibilidade");
	var tab2 = document.getElementById("cursos");
	var tab3 = document.getElementById("topicos");

	if (index == 1) {
		tab1.style.display = 'block';
		tab2.style.display = 'none';
		tab3.style.display = 'none';
		document.getElementsByClassName("nav-link")[0].className = "nav-link active";
		document.getElementsByClassName("nav-link")[1].className = "nav-link";
		document.getElementsByClassName("nav-link")[2].className = "nav-link";

	}
	if (index == 2) {
		tab1.style.display = 'none';
		tab2.style.display = 'block';
		tab3.style.display = 'none';
		document.getElementsByClassName("nav-link")[0].className = "nav-link";
		document.getElementsByClassName("nav-link")[1].className = "nav-link active";
		document.getElementsByClassName("nav-link")[2].className = "nav-link";
	}
	if (index == 3) {
		tab1.style.display = 'none';
		tab2.style.display = 'none';
		tab3.style.display = 'block';
		document.getElementsByClassName("nav-link")[0].className = "nav-link";
		document.getElementsByClassName("nav-link")[1].className = "nav-link";
		document.getElementsByClassName("nav-link")[2].className = "nav-link active";
	}
}

$(".test-comentado-video .nav-tabs a[data-toggle=tab]").on("click", function(e) {
	$('#modalBodyMedia').html('');
	if ($(this).data('video') == 'S') {
		$('#divQuestao1').attr("class", "col-md-6");
		$('#divQuestao2').attr("class", "col-md-6");
		openMedia(null, $(this).attr('id'), '', 'V');
	} else {
		$('#divQuestao1').attr("class", "col-md-12");
		$('#divQuestao2').attr("class", "d-none");
	}
	return true;
});

function configurarModalQuestaoOcorrencia(tpOcorrencia) {
	var tipoOcorrencia = parseInt(tpOcorrencia, 10);
	if (isNaN(tipoOcorrencia)) {
		tipoOcorrencia = 1;
	}

	var ehRecurso = tipoOcorrencia == 2;
	var campoDescricao = $('#descricaoErro');
	var validator = $("#QuestaoErroForm").data('validator');

	if ($('#tituloModalFrame2').length > 0) {
		$('#tituloModalFrame2').text(ehRecurso ? 'Marcar questão para recurso' : 'Reportar erro da questão');
	}
	if ($('#textoModalQuestaoErro').length > 0) {
		$('#textoModalQuestaoErro').text(ehRecurso ? 'Use esta área para marcar a questão como passível de recurso. Você pode informar uma justificativa, se desejar.' : 'Esta área é exclusiva para reportar erros técnicos ou problemas na questão. Para esclarecimento de dúvidas sobre o conteúdo, utilize os canais de dúvidas.');
	}
	if ($('#labelDescricaoQuestaoErro').length > 0) {
		$('#labelDescricaoQuestaoErro').text(ehRecurso ? 'Justificativa (opcional):' : 'Descrição do problema:');
	}
	if ($('#btnQuestaoErroSend').length > 0) {
		$('#btnQuestaoErroSend').text(ehRecurso ? 'Marcar recurso' : 'Enviar');
	}

	if (ehRecurso) {
		campoDescricao.removeAttr('required');
		campoDescricao.removeAttr('data-rule-required');
		campoDescricao.attr('placeholder', 'Se quiser, descreva resumidamente o motivo do recurso.');
	} else {
		campoDescricao.attr('required', 'required');
		campoDescricao.attr('data-rule-required', 'true');
		campoDescricao.attr('placeholder', 'Descreva o erro encontrado na questão.');
	}

	if ($('#tpOcorrenciaErro').length > 0) {
		$('#tpOcorrenciaErro').val(tipoOcorrencia);
	}
	if (validator) {
		validator.resetForm();
	}
	campoDescricao.removeClass('error');
}

function abrirQuestaoOcorrencia(idQuestao, tpOcorrencia) {
	$('#idQuestaoErro').val(idQuestao);
	$('#idAlunoMensalidadeErro').val($('#idAlunoMensalidade').val());
	$('#idAvaliacaoErro').val($('#idAvaliacao').val());
	$('#idCursoErro').val($('#idCurso').val());
	$('#tipoCursoErro').val($('#tipoCurso').val());
	$('#descricaoErro').val('');
	configurarModalQuestaoOcorrencia(tpOcorrencia);
	$('#modalErro').modal('show');
}

function abrirQuestaoErro(idQuestao) {
	abrirQuestaoOcorrencia(idQuestao, 1);
}

$(document).on("click", '#btnQuestaoErroSend', function() {

	if (!$("#QuestaoErroForm").valid()) {
		return;
	}

	$.post("/portal/salvarQuestaoErro", $("#QuestaoErroForm").serialize(), function(data) {
		if (data.status == 0) {
			$('#descricaoErro').val('');
			$('#modalErro').modal('hide');
		} else {
			alert(data.message);
		}
	}, 'json');
});





function setTestAgendamento(idAvaliacao, token) {

	if (!$("#TestAgendamentoForm").valid()) {
		return;
	}

	$.post("/portal/setTestAgendamento", { dataAgendamento: $("#dataAgendamento").val(), turnoAgendamento: $("#turnoAgendamento").val(), token: token, idAvaliacao: idAvaliacao }, function(data) {
		if (data.message.length > 0) {
			alert(data.message);
			$("#modal1").modal("hide");
		}
	}, 'json');
}

function documentoAlunoDuvida(id, nomeArquivo) {
	window.open('/portal/documentoAlunoDuvida?idDuvida=' + id + '&nomeArquivo=' + nomeArquivo, '_self');
}


function documentoProfessorDuvida(id, nomeArquivo) {
	window.open('/portal/documentoProfessorDuvida?idDuvida=' + id + '&nomeArquivo=' + nomeArquivo, '_self');
}

function editText(id) {
	const textElement = document.getElementById(`titulo-${id}`);
	const descElement = document.getElementById(`desc-${id}`);
	const editIcon = document.getElementById(`icon-${id}`);

	// Verifica se o texto esta em modo de edicao
	if (textElement.contentEditable === 'true') {
		// Desabilita a edicao
		textElement.contentEditable = 'false';
		descElement.contentEditable = 'false';
		editIcon.className = 'fas fa-pencil-alt';
		// Aqui voce pode salvar o novo texto em algum lugar, como em uma base de dados, se necessario
		const newTitulo = textElement.innerText;
		const newDesc = descElement.innerText;

		textElement.classList.remove('edit-text');
		descElement.classList.remove('edit-text');
		
		$.post("/portal/atualizarAnotacao", { titulo: newTitulo, descricao: newDesc, id: id }, function() {
		}, 'json');
		
		

	} else {
		textElement.classList.add('edit-text');
		descElement.classList.add('edit-text');
		textElement.contentEditable = 'true';
		descElement.contentEditable = 'true';
		editIcon.className = 'fas fa-save';
	}
}


function deleteBloco(id) {
	var confirmDelete = confirm("Tem certeza que deseja excluir?");

	if (confirmDelete) {
		$.post("/portal/deletarAnotacao", { id: id }, function() {
		}, 'json');
		document.location.reload(true); 
		document.location.reload(true);
	}
}

function imprimirTela() {
	window.print();
}

function toExcel() {
	$.post("/portal/BlocoNotaToExcel", function(data) {
		const wb = XLSX.utils.book_new();

		const ws = XLSX.utils.json_to_sheet(data);

		XLSX.utils.book_append_sheet(wb, ws, "Dados");

		const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

		const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

		const url = URL.createObjectURL(blob);

		const downloadLink = document.createElement("a");
		downloadLink.href = url;
		downloadLink.download = "dados.xlsx";
		downloadLink.textContent = "Baixar Excel";

		document.body.appendChild(downloadLink);
		downloadLink.click();
		URL.revokeObjectURL(url);
	}, 'json');
}


function cancelarAtendimento(id) {
	var confirmDelete = confirm("Tem certeza que deseja cancelar?");

	if (confirmDelete) {
		$.post("/portal/cancelarAtendimento", { id: id }, function() {
		}, 'json');
		document.location.reload(true); document.location.reload(true);
	}
}


function select2String(id) {
	var selectElement = document.getElementById(id);
	var selectedValues = [];

	for (var i = 0; i < selectElement.options.length; i++) {
		selectedValues.push(selectElement.options[i].value);
	}

	return selectedValues.join(",");
}


function arquivarAvaliacaoBaseQuestao(event, token) {

	if (confirm($("#btnArquivar" + token).data("msgconfirm")) == true) {
		$.getJSON("/portal/arquivarAvaliacaoBaseQuestao", { format: "json", token: token }).done(function(data) {
			if (data.status == 0) {
				alert($("#btnArquivar" + token).data("msgsucess"));
				$("#li-" + token).remove();
			}
			if (data == null || data.message.length > 0) {
				alert($("#btnArquivar" + token).data("msgerror") + " " + data.message);
			}
		});
	}
}

function deletaLinhas(tabela) {
	for (var i = tabela.rows.length - 1; i >= 1; i--) {
		tabela.deleteRow(i);
	}
}

function reiniciaEditor() {
	tinymce.remove('.mceEditorAlternativa');

	tinymce.init({
		editor_selector: 'mceEditorAlternativa',
		mode: "specific_textareas",
		height: 100,
		menubar: false,
		browser_spellcheck: true,
		language: 'pt_BR',
		branding: false,
		plugins: [
			'advlist autolink lists link image charmap print preview anchor',
			'searchreplace visualblocks fullscreen',
			'insertdatetime media wordcount textcolor emoticons'
		],
		toolbar: 'forecolor backcolor bold italic underline | alignleft aligncenter alignright alignjustify | removeformat | subscript superscript | charmap emoticons'
	});

}


function loadFormulario() {
	$('#modalFooter1').show();
	$('#modalDialog1').width('100%');
	$('#modalDialog1').height('auto');
	$('#btnMaterial').hide();
	$('#btnChat').hide();
	$('#btnDownload').hide();
	$('#btnDownloadTrilha').hide();
	$('#divClassificacao').hide();
	$('#divClassificacao').attr("style", "display: none !important");
	$('#btnFavoritos').hide();
	$('#btnAnotacoes').hide();
	$('#btnAnotacoes').attr("style", "display: none !important");
	$('#btnDuvida').hide();
	$('#modalDialog1').css('max-width', '100%');
	$('.modal-content').css('background-color', '#FFFFFF');

	var heightCompoment = $(window).height() - 110;
	if ($('#modalBodyMedia').height() < 100) {
		if ($('#modalContent').height() > 100) {
			heightCompoment = $('#modalContent').height();
		}
	} else {
		heightCompoment = $('#modalBodyMedia').height();
	}
	$('#modalBodyMedia').height(heightCompoment)
	$('#modalBodyMedia').css('overflowY', 'auto');


	$('#btnEnviarFormularioDinamico').click(function() {
		
		if ($("#formularioDinamico").valid() == false) {
            alert("Existem erros no formulário. Por favor, corrija-os.");
            return false;
        }
		
		$.post("/portal/enviarFormularioDinamico", $("#formularioDinamico").serialize(), function(data) {
			if (data.status == 0) {
				alert('Dados enviados com sucesso!');

				fecharModalFormulario();
				window.parent.fecharModalFormulario();
				
			} else {
				alert(data.message);
			}
		}, 'json');
	});
}

function fecharModalFormulario() {
	var modais = $(".modalFormulario");
	modais.each(function() {
		$(this).modal('hide');
		$(this).hide();
		$('.modal-backdrop').remove();
	});				

	var modais = $("#modal1");
	modais.each(function() {
		$(this).modal('hide');
		$(this).hide();
		$('.modal-backdrop').remove();
	});				
}
  
    function generatePDF() {
    const element = document.getElementById('content');

    const options = {
      margin: 10,
      filename: 'notas.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf(element, options);
  }
  
function ehNumero(s) {
    var i;
    var dif = 0;
    for (i = 0; i < s.length; i = i + 1) {
        var c = s.charAt(i);
        if (!((c >= "0") && (c <= "9"))) {
            dif = 1;
        }
    }
    if (dif == 1) {
        return false;
    }
    return true;
}  

$(document).on("click", '[name="btnTranscricaoDownload"]', function() {
	$('#btnTranscricaoDownload' + $(this).data('value')).prop("disabled", "true");
	$("#modalLoading").modal({
		backdrop: "static",
		keyboard: false,
		show: true
	});
	var token = $(this).data('token');
	
	window.open('/portal/trascricao-download/' + token);

});

$(document).on("click", '[name="btnEbookDownload"]', function() {
	$('#btnEbookDownload' + $(this).data('value')).prop("disabled", "true");
	$("#modalLoading").modal({
		backdrop: "static",
		keyboard: false,
		show: true
	});
	var token = $(this).data('token');
	
	window.open('/portal/ebook-ai-download/' + token);

});


function carregaTranscricao(token, divTranscricao) {

	$.getJSON("/portal/getTranscricao", { format: "json", token: token }).done(function(transcricao) {
	
		var bodyTranscription = $('#' + divTranscricao);
		
		if (transcricao == null) {
			var bloco = '<div class="bloco palavra">'; 
			bloco += 'Este vídeo não tem legenda, contacte nossa equipe!';
			bloco += '</div>';
			bodyTranscription.html(bloco);
			
	    	return;
		}
		
		bodyTranscription.html('');
	    for (var i = 0; i < transcricao.transcripts.length; i++) {
	    	var bloco = '<div class="bloco" data-confidence="' + transcricao.transcripts[i].confidence + '">';
	    	for (var j = 0; j < transcricao.transcripts[i].words.length; j++) {
	    		var classe = "";
	    		for (var k = transcricao.transcripts[i].words[j].startInt; k <= transcricao.transcripts[i].words[j].endInt; k++) {
	    			classe += ' t-' + k;
	    		}
	    		bloco += '<span class="palavra ' + classe + '" data-inicio="' + transcricao.transcripts[i].words[j].start + '" data-fim="' + transcricao.transcripts[i].words[j].end + '"><span data-texto="true">' + transcricao.transcripts[i].words[j].word + '</span></span>';
	    		bloco += '<span class="espaco t-' + transcricao.transcripts[i].words[j].endInt + '">&nbsp;</span>';
	        }
	    	bloco += '</div>';
	    	bodyTranscription.append(bloco);
	    }
	});    
}

function abrirModal(url) {
	$('#modalFormularioFrame').attr('src', url);
	$('#modalFormulario').modal('show');
}

function goBack() {
    if (document.referrer) {
        window.location.href = document.referrer;
    } else {
        history.back();
    }
}

function getURLIntegracao(token){
	$.ajax({
		url: "/portal/getURLIntegracao?token=" + token,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			if (data == null) {
				alert('Não foi possível abrir o link deste produto, contate o suporte.');
			}
			window.open(data, '_blank');
		}
	});
}

function truncateToOneDecimal(number) {
  return Math.floor(number * 10) / 10;
}

function converterDataSimples(dataStr) {
    var partes = dataStr.split('/');
    return partes[2] + '-' + partes[1] + '-' + partes[0];
}

function converterDataSimples2(dataStr) {
    var partes = dataStr.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function formatTime(totalSeconds) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds));

    const hours = Math.floor(totalSeconds / 3600);
    const remainingSecondsAfterHours = totalSeconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const seconds = remainingSecondsAfterHours % 60;

    const parts = [];
    if (hours > 0) {
        parts.push(hours === 1 ? '1 hora' : `${hours} horas`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} min`);
    }
    if (seconds > 0 || parts.length === 0) {
        parts.push(`${seconds}s`);
    }

    if (parts.length > 1) {
        return parts.slice(0, -1).join(' ') + ' e ' + parts[parts.length -1];
    } else {
        return parts[0];
    }
}

function criarEventoApagarLinha(id) {
	$("#linha" + id).click(function() {
		if ($('#btnLinha').length > 0) {
			if (confirm('Deseja remover a linha?')) {
				
				$.post("/portal/apagarFlagComentario", { id: id}, function(data) {
					$("#linha" + id).remove();
				}, 'json');
				
				
			}
		}
	});
}

$('[name="btnBoletoOnline"]').click(function() {
	var id = $(this).data('value');
	var tipo = $(this).data('tipo');
	var url = '';
	if (tipo == 'V') {
		PagSeguroDirectPayment.onSenderHashReady(function(response) {
			if (response.status == 'error') {
				return false;
			}
			url = '/portal/boleto-online?id=' + id + "&userHash=" + response.senderHash;

			$.getJSON(url, { format: "json" }).done(function(data) {
				if (data.status == 0) {
					$('#pixPopupDescription').hide();
					$('#boletoPopupDescription').show();
					$("#aBoletoDownload").prop("href", data.message);
					$("#divBoletoDownload").html(data.message);
					$('#boletoPopupTitle').text('Boleto');
					$('#boletoPopup').modal('show');
				} else {
					alert(data.message);
				}
			});
		});
	} else {
		url = '/portal/boleto-online?id=' + id;
		$.getJSON(url, { format: "json" }).done(function(data) {
			if (data.status == 0) {
				$('#pixPopupDescription').hide();
				$('#boletoPopupDescription').show();
				$("#aBoletoDownload").prop("href", data.message);
				$("#divBoletoDownload").html(data.message);
				$('#boletoPopupTitle').text('Boleto');
				$('#boletoPopup').modal('show');
			} else {
				alert(data.message);
			}
		});
	}
});

function copyDownloadButton(tokenButton) {
	
  	var $link   = $('#btnMaterialDownload' + tokenButton);
  	var $target = $('#btnDownloadDownloadFrame');

	$target.data('path', $link.data('path'));
	$target.data('posicao', $link.data('posicao'));
	$target.data('token', $link.data('token'));
	$target.data('value', $link.data('value'));
	$target.data('tipo', $link.data('tipo'));

}

$('[name="btnPix"]').click(function() {
	var id = $(this).data('value');
	var url = '';
	url = '/portal/pix-online?id=' + id;
	$.getJSON(url, { format: "json" }).done(function(data) {
		if (data.status == 0) {
			$('#pixPopupDescription').show();
			$('#boletoPopupDescription').hide();
			$("#qrcode").data("url", data.message);
			$("#copyLinkPix").val(data.message);
			
			$("#qrcode").empty();
			
			var qrcode = new QRCode(document.getElementById("qrcode"), {
				text: $("#qrcode").data("url"),
				width: 250,
				height: 250,
				colorDark: "#000000",
				colorLight: "#ffffff",
				correctLevel: QRCode.CorrectLevel.H
			});
			$('#boletoPopupTitle').text('Pix');
			$('#boletoPopup').modal('show');
		} else {
			alert(data.message);
		}
	});
});


function openTopicoFlashcard(tokenFlash, whereDiv) {
	
	var token = 'flash-' + $('#token').val() + "-" + tokenFlash;
	 
	var url = '/portal/media?token=' + token;
	$.ajax({
		url: url,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			$(whereDiv).html(data);
		}
	});
}

function carregaEbookAI(token, divEbook) {
	
	var url = '/portal/getEbookAI?token=' + token;

	$.ajax({
		url: url,
		dataType: 'html',
		type: 'GET',
		async: true,
		success: function(data) {
			$('#' + divEbook).html(data);
		}
	});
}

function configurarEventosDesenho() {
    var $doc = $('#divDocument');
    
    // Remover eventos antigos primeiro
    removerEventosDesenho();
    
    // Criar SVG se não existir
    criarSVGSeNecessario();
    
    // Mouse down - iniciar linha
    $doc.on('mousedown.desenho', function(e) {
        if ($('#btnLinha').data('habilitado') != 1) return;
        if ($(e.target).hasClass('flag-comentario')) return;
        if ($(e.target).closest('.linhaCorrecao').length > 0) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        isDrawing = true;
        
        var offset = getDocumentOffset();
        drawStartX = e.pageX - offset.left;
        drawStartY = e.pageY - offset.top;
        
        criarLinhaPreview(drawStartX, drawStartY);
    });
    
    // Mouse move - atualizar preview
    $doc.on('mousemove.desenho', function(e) {
        if (!isDrawing) return;
        
        e.preventDefault();
        
        var offset = getDocumentOffset();
        var currentX = e.pageX - offset.left;
        var currentY = e.pageY - offset.top;
        
        currentX = Math.max(0, Math.min(currentX, getWidth()));
        currentY = Math.max(0, Math.min(currentY, getHeight()));
        
        atualizarLinhaPreview(currentX, currentY);
    });
    
    // Mouse up - finalizar linha
    $doc.on('mouseup.desenho', function(e) {
        if (!isDrawing) return;
        
        isDrawing = false;
        
        var offset = getDocumentOffset();
        var endX = e.pageX - offset.left;
        var endY = e.pageY - offset.top;
        
        endX = Math.max(0, Math.min(endX, getWidth()));
        endY = Math.max(0, Math.min(endY, getHeight()));
        
        // Verificar tamanho mínimo (evitar cliques acidentais)
        var distancia = Math.sqrt(Math.pow(endX - drawStartX, 2) + Math.pow(endY - drawStartY, 2));
        
        if (distancia < 10) {
            removerLinhaPreview();
            return;
        }
        
        removerLinhaPreview();
        salvarLinhaDesenho(drawStartX, drawStartY, endX, endY);
    });
    
    // Mouse leave - cancelar se sair da área
    $doc.on('mouseleave.desenho', function(e) {
        if (isDrawing) {
            isDrawing = false;
            removerLinhaPreview();
        }
    });
}

function removerEventosDesenho() {
    $('#divDocument').off('mousedown.desenho');
    $('#divDocument').off('mousemove.desenho');
    $('#divDocument').off('mouseup.desenho');
    $('#divDocument').off('mouseleave.desenho');
}

function getDocumentOffset() {
    if ($('#divDocument img').length > 0) {
        return $('#divDocument img').offset();
    } else if ($('#divDocument canvas').length > 0) {
        return $('#divDocument canvas').first().offset();
    }
    return $('#divDocument').offset();
}

function criarSVGSeNecessario() {
    if ($('#svglinha').length == 0) {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" id="svglinha" version="1.1" ' +
                  'width="' + getWidth() + '" height="' + getHeight() + '" ' +
                  'style="position: absolute; top: 0; left: 0;"></svg>';
        
        if ($('#divDocument img').length > 0) {
            $('#divDocument').append(svg);
        } else {
            $('#divDocument2').append(svg);
        }
    }
}

function criarLinhaPreview(x, y) {
    criarSVGSeNecessario();
    removerLinhaPreview();
    
    var cor = getCor();
    
    var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newLine.setAttribute('id', previewLineId);
    newLine.setAttribute('x1', x);
    newLine.setAttribute('y1', y);
    newLine.setAttribute('x2', x);
    newLine.setAttribute('y2', y);
    newLine.setAttribute('stroke-linecap', 'round');
    newLine.setAttribute('stroke-opacity', '0.5');
    newLine.setAttribute('stroke-width', '8');
    newLine.setAttribute('stroke', cor);
    newLine.setAttribute('stroke-dasharray', '5,5');
    newLine.style.pointerEvents = 'none';
    
    $('#svglinha').append(newLine);
}

function atualizarLinhaPreview(x, y) {
    var preview = document.getElementById(previewLineId);
    if (preview) {
        preview.setAttribute('x2', x);
        preview.setAttribute('y2', y);
    }
}

function removerLinhaPreview() {
    $('#' + previewLineId).remove();
}

function salvarLinhaDesenho(x1, y1, x2, y2) {
    var cor = getCor();
    var idTemp = 'temp-' + parseInt(Math.random() * 10000);
    
    // Criar linha visual imediatamente
    criarLinha(idTemp, x1, y1, x2, y2, cor);
    
    // Salvar no servidor
    $.post("/portal/salvarFlagComentario", {
        id: 0,
        idAvaliacaoAluno: $("#idAvaliacaoAluno").val(),
        comentario: '',
        topo: Math.round(y1),
        esquerda: Math.round(x1),
        largura: getWidth(),
        altura: getHeight(),
        tipo: 2,
        topo2: Math.round(y2),
        esquerda2: Math.round(x2),
        cor: cor
    }, function(data) {
        if (data.status == 0) {
            var novoId = data.message;
            $('#linha' + idTemp).attr('id', 'linha' + novoId);
            criarEventoApagarLinha(novoId);
        } else {
            alert(data.message);
            $('#linha' + idTemp).remove();
        }
    }, 'json').fail(function() {
        alert('Erro ao salvar a linha');
        $('#linha' + idTemp).remove();
    });
}
