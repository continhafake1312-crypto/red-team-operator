var documentoDRMState = {
	idDocumento: null,
	tipoDocumento: null,
	totalPaginas: 0,
	chave: null,
	paginaAtual: 1,
	zoom: 1,
	fontScale: 1,
	entrelinha: 'normal',
	objectUrl: null,
	requestToken: 0,
	paginaInicial: 1,
	paginaFinal: 0,
	indicePaginas: [],
	indiceTopicos: [],
	paginaAtualMeta: null,
	ancoraPendente: null,
	ancorasResolvidas: {},
	notasRodapeCache: {},
	notaRodapeChaveAtual: null,
	notaRodapeFixada: false,
	notaRodapeTimer: null,
	notaRodapeTrigger: null,
	carregandoPagina: false,
	avancoScrollAtivo: false,
	anotacoes: [],
	anotacoesCarregadas: false,
	anotacoesCarregando: false,
	anotacaoFiltro: 'page',
	anotacaoEditando: null,
	anotacaoCor: 'amarelo',
	selecaoEpub: null,
	selecaoEpubCor: 'amarelo',
	anotacaoFocoPendente: null,
	alvosScroll: [],
	layoutObserver: null,
	layoutTimer: null,
	themeObserver: null,
	touchSwipe: {
		active: false,
		startX: 0,
		startY: 0,
		deltaX: 0,
		deltaY: 0,
		lockedAxis: ''
	}
};

function loadDocument(id) {
	$('#modalDialog1').width('100%');
	$('#modalDialog1').height('100%');
	$('#modalFooter1').show();
	$('#btnMaterial').hide();
    $('#btnChat').hide();
	$('#btnDuvida').hide();
    $('#btnAnotacoes').hide();
	$('#btnAnotacoes').attr("style", "display: none !important");
	if ($('#btnFechar').length > 0) $('#btnFechar').prop('disabled',false);
	if ($('#btnClose1').length > 0) $('#btnClose1').prop('disabled',false);
	if ($('#btnAvancar').length > 0) $('#btnAvancar').prop('disabled',false);
	if ($('#btnRetroceder').length > 0) $('#btnRetroceder').prop('disabled',false);
	
	if ($('#tituloNomeAula').length > 0) {
		$('#tituloNomeAula').tooltip('dispose');
		$('#tituloNomeAula').html($('#nomeAula').val()).attr('title', $('#nomeAula').val()).tooltip();
	}

	if ($('#tipoDocumento').val() == 'D') {
		$('#btnDownloadTrilha').show();
		if($('.linkSidebarPrimaryDownloadOpen').length > 0) $('.linkSidebarPrimaryDownloadOpen').show();
	} else {
		$('#btnDownloadTrilha').hide();
		if($('.linkSidebarPrimaryDownloadOpen').length > 0) $('.linkSidebarPrimaryDownloadOpen').hide();
	}

	$('#btnFavoritos').show();
	$('#btnAvancar').show();
	$('#btnRetroceder').show();
	$('#btnTopico').show();
	$('#divClassificacao').show();

    $('#modalDialog1').css('max-width','100%');
    $('.modal-content').css('background-color','#FFFFFF');

	$('#modalBodyMedia').css('overflowY', '');
    var heightVideo = $(window).height() - 110;
	if ($('#modalBodyMedia').height() < 100) {
		if ($('#modalContent').height() > 100) {
			heightVideo = $('#modalContent').height();
		}
	} else {
		heightVideo = $('#modalBodyMedia').height();
	}
    
	$('#btnDownload').data('value', id)
	if ($('#iFrameDocument').length > 0) $('#iFrameDocument').height(heightVideo);
	if ($('#divDocument').length > 0) $('#divDocument').height(heightVideo);

	//load favorito
	if ($('#favorito').length > 0) {
		if ($('#favorito').val() == 'true') {
			if ($('#iconeMediaFavorito').length > 0) $('#iconeMediaFavorito').attr('class', 'fas fa-star');
			if ($('#iconeMediaFavorito4').length > 0) $('#iconeMediaFavorito4').attr('checked', 'checked');
		} else {
			if ($('#iconeMediaFavorito').length > 0) $('#iconeMediaFavorito').attr('class', 'far fa-star');
			if ($('#iconeMediaFavorito4').length > 0) $('#iconeMediaFavorito4').removeAttr('checked');
		}
	}
	if ($('#classificacao').length > 0) {
		for(var i = 1; i <= 5; i++){
			$('#star' + i).attr('class','fas fa-star star-unchecked');
		} 
		for(var i = 1; i <= $('#classificacao').val(); i++){
			$('#star' + i).attr('class','fas fa-star star-checked selected');
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

	var tipoDocumento = $('#tipoDocumento').val();
	var isDocumentoDrm = (tipoDocumento == '1' || tipoDocumento == '2');

	bindSwipeDRM();
		
	if (isDocumentoDrm) {
		$('#btnDownload').hide();
		$('#btnDownloadDownloadFrame').hide();
		$('#btnDownloadTrilha').hide();
		if ($('.linkSidebarPrimaryDownloadOpen').length > 0) $('.linkSidebarPrimaryDownloadOpen').hide();

		$('#divDocument').hide();
		$('#iFrameDocument').hide();

		if ($('#viewerDrmRoot').length > 0) {
			$('#viewerDrmRoot').css('min-height', heightVideo + 'px');
		}

		$('#btnDrmMenu').off('click').on('click', function() {
			var $toolbar = $('#drmViewerToolbar');
			$toolbar.toggleClass('is-menu-open');
		
			if ($toolbar.hasClass('is-menu-open')) {
				setTimeout(function() {
					refreshIndiceSelectDRM();
				}, 0);
			}
		});

		$('#btnDrmAnterior, #btnDrmLateralAnterior').off('click').on('click', navegarPaginaAnteriorDRM);
		$('#btnDrmProxima, #btnDrmLateralProxima').off('click').on('click', navegarProximaPaginaDRM);
		
		$('#drmPaginaAtualInput').off('change').on('change', function() {
			var pagina = parseInt($(this).val(), 10);
			pagina = normalizarPaginaDRM(pagina);

			if (pagina != documentoDRMState.paginaAtual) {
				carregarPaginaDRM(pagina);
			} else {
				atualizarControlesDRM(pagina);
			}
		});

		$('#drmPaginaAtualInput').off('keydown').on('keydown', function(event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				$(this).change();
			}
		});

		$('#btnDrmZoomMenos').off('click').on('click', function() {
			alterarZoomDRM(-0.1);
		});

		$('#btnDrmZoomMais').off('click').on('click', function() {
			alterarZoomDRM(0.1);
		});

		$('#drmZoomRange')
			.off('input.documentoDRMZoom change.documentoDRMZoom')
			.on('input.documentoDRMZoom change.documentoDRMZoom', function() {
				var percentual = parseInt($(this).val(), 10);
				if (!isNaN(percentual)) {
					definirZoomDRM(percentual / 100);
				}
			});
	
		if (tipoDocumento == '2') {
			$('#drmFontControls').show();
		} else {
			$('#drmFontControls').hide();
		}

		$('#btnDrmFonteMenos').off('click').on('click', function() {
			alterarFonteDRM(-0.1);
		});

		$('#btnDrmFonteMais').off('click').on('click', function() {
			alterarFonteDRM(0.1);
		});

		$('#btnDrmLineHeightMenu').off('click').on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			alternarMenuEntrelinhaEpubDRM();
		});

		$('.viewer-line-height-button').off('click').on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			definirEntrelinhaEpubDRM($(this).attr('data-line-height'));
			$('#btnDrmLineHeightMenu').focus();
		});

		$(document)
			.off('click.documentoDRMLineHeight keydown.documentoDRMLineHeight')
			.on('click.documentoDRMLineHeight', function(event) {
				if ($(event.target).closest('#drmLineHeightControls').length == 0) {
					fecharMenuEntrelinhaEpubDRM();
				}
			})
			.on('keydown.documentoDRMLineHeight', function(event) {
				if (event.key === 'Escape' && $('#drmLineHeightControls').hasClass('is-open')) {
					fecharMenuEntrelinhaEpubDRM();
					$('#btnDrmLineHeightMenu').focus();
				}
			});

		vincularControlesAnotacoesDRM();
		
		$('#drmIndiceSelect').off('change').on('change', function() {
			var pagina = parseInt($(this).val(), 10);
		
			if (!isNaN(pagina) && pagina != documentoDRMState.paginaAtual) {
				carregarPaginaDRM(normalizarPaginaDRM(pagina));
			}
		});

		
		initDocumentoDRM({
			idDocumento: $('#idDocumento').val(),
			tipoDocumento: tipoDocumento,
			token: $('#token').val()
		});

		return;
	}

	$('#divDocument').data('page-rende', 0);
	$('#divDocument').on('scroll', function() {
		if ($('#divDocument').scrollTop() >= ($('#divDocument').prop('scrollHeight') - $('#divDocument').prop('clientHeight') - 10)) {
			var page = $('#divDocument').data('page-rende');
			var total = $('#divDocument').data('page-total');
			page++;
			if (page <= total) {
				var scale = 2;
				var canvas = document.createElement("canvas"); 
				var viewer = document.getElementById('divDocument');
				canvas.id = 'canvas' + page;
				canvas.className = 'pdf-canvas';    
				var ctx = canvas.getContext('2d');
				pdfjsLib.disableStream = true;
				viewer.appendChild(canvas);
				renderPage(page, canvas, ctx, scale, total);
			}
		}
	}); 
	
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
}

function gerarPDFDocumento(viewerId, id, tipo, token, start, end, callback) {
	fetch('/portal/documento-online-key?idDocumento=' + id + '&tipo=' + tipo + '&token=' + token).then(response => {
		return response.json();
	}).then(function(data) {
		if (data != null) {
			gerarPDF(viewerId, data.url, start, end, callback);
		}
	}).catch(err => {
		alert('Erro na busca do documento');
	});
}

var total = 0;
var pdfjsLib;
var pdfDoc;
function gerarPDF(viewerId, url, start, end, callback) {
	pdfjsLib = window['pdfjs-dist/build/pdf'];
	pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
	pdfjsLib.disableWorker = true;

	var scale = 2;
	total = 0;
	pdfjsLib.getDocument(url).promise.then(function(pdfDoc) {
		if (this.pdfDoc) {
			this.pdfDoc.destroy();
		}
		this.pdfDoc = pdfDoc;

		var viewer = document.getElementById(viewerId);
		var div = document.createElement("div"); 
		div.className = "pdf-progressbar";
		div.style.width = "0px";
		div.id = 'divPdfProgressBar';
		viewer.innerHTML = '';
		viewer.appendChild(div);

		var pageStart = 1;
		if (start != null && start > 0 && start <= pdfDoc.numPages) pageStart = start;

		var pageEnd = pdfDoc.numPages;
		if (end != null && end > 0 && end <= pdfDoc.numPages) pageEnd = end;

		$('#divDocument').data('page-total', (pageEnd - pageStart)+1);

		viewer.appendChild(div)
		for(page = pageStart; page <= pageEnd; page++) {
			var canvas = document.createElement("canvas"); 
			canvas.id = 'canvas' + page;
			canvas.className = 'pdf-canvas';    
			var ctx = canvas.getContext('2d');
			pdfjsLib.disableStream = true;
			viewer.appendChild(canvas);
			renderPage(page, canvas, ctx, scale, (pageEnd - pageStart)+1);
			if (page == 20) break;
		}
		if (callback != null) {
			sleep(1000);
			callback();
		}
	});
}

function renderPage(num, canvas, context, scale, totalPagina) {
	pageRendering = true;
	// Using promise to fetch the page
	pdfDoc.getPage(num).then(function(page) {
		var viewport = page.getViewport({scale: scale});
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		// Render PDF page into canvas context
		var renderContext = {
		canvasContext: context,
		viewport: viewport
		};
		var renderTask = page.render(renderContext);

		// Wait for rendering to finish
		renderTask.promise.then(function() {
			total++;
			var percentage = total / totalPagina;
			divPdfProgressBar = document.getElementById('divPdfProgressBar');
			divPdfProgressBar.style.width = (percentage * canvas.offsetWidth) + "px";
			if (total == totalPagina) divPdfProgressBar.style.display = 'none';
		});
	});
	$('#divDocument').data('page-rende', num);
}

function gerarEPUBDocumento(viewerId, id, tipo, idContrato, idCurso, tipoCurso) {
	geraEPUB(viewerId, '/portal/documento.epub?tipo=' + tipo + '&idDocumento=' + id + '&idContrato=' + idContrato + '&idCurso=' + idCurso + '&tipoCurso=' + tipoCurso);
}

function geraEPUB(viewerId, url){
	var currentSectionIndex = undefined;

	var book = ePub(url);
	var rendition = book.renderTo(viewerId, {
		width: "100%",
		height: 600,
		spread: "always"
	});

	rendition.display(currentSectionIndex);
	book.ready.then(() => {
		var next = document.getElementById("next");

		next.addEventListener("click", function(e){
		book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
		e.preventDefault();
		}, false);

		var prev = document.getElementById("prev");
		prev.addEventListener("click", function(e){
		book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
		e.preventDefault();
		}, false);

		var keyListener = function(e){
		if ((e.keyCode || e.which) == 37) {
			book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
		}
		if ((e.keyCode || e.which) == 39) {
			book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
		}
		};

		rendition.on("keyup", keyListener);
		document.addEventListener("keyup", keyListener, false);
	})

	rendition.on("rendered", function(section){
		var current = book.navigation && book.navigation.get(section.href);

		if (current) {
			var $select = document.getElementById("epubToc");
			var $selected = $select.querySelector("option[selected]");
			if ($selected) {
				$selected.removeAttribute("selected");
			}

			var $options = $select.querySelectorAll("option");
			for (var i = 0; i < $options.length; ++i) {
				let selected = $options[i].getAttribute("ref") === current.href;
				if (selected) {
					$options[i].setAttribute("selected", "");
				}
			}
		}
	});

	rendition.on("relocated", function(location){
		var next = book.package.metadata.direction === "rtl" ?  document.getElementById("prev") : document.getElementById("next");
		var prev = book.package.metadata.direction === "rtl" ?  document.getElementById("next") : document.getElementById("prev");

		if (location.atEnd) {
			next.style.visibility = "hidden";
		} else {
			next.style.visibility = "visible";
		}

		if (location.atStart) {
		prev.style.visibility = "hidden";
		} else {
		prev.style.visibility = "visible";
		}
	});

	rendition.on("layout", function(layout) {
		let viewer = document.getElementById(viewerId);

		if (layout.spread) {
		viewer.classList.remove('single');
		} else {
		viewer.classList.add('single');
		}
	});

	window.addEventListener("unload", function () {
		this.book.destroy();
	});

	book.loaded.navigation.then(function(toc){
		var $select = document.getElementById("epubToc");
		docfrag = document.createDocumentFragment();

		toc.forEach(function(chapter) {
			var option = document.createElement("option");
			option.textContent = chapter.label;
			option.setAttribute("ref", chapter.href);

			docfrag.appendChild(option);
		});
		$select.appendChild(docfrag);

		$select.onchange = function(){
			var index = $select.selectedIndex;
			url = $select.options[index].getAttribute("ref");
			rendition.display(url);
			return false;
		};
	}); 
}

function initDocumentoDRM(config) {
	if (!$('#viewerDrmRoot').length) {
		return;
	}

	resetDocumentoDRM();
	var requestToken = documentoDRMState.requestToken;
	
	$('#viewerDrmRoot').html(
		'<div class="text-center py-5">' +
			'<p class="mb-2">Preparando leitura segura...</p>' +
		'</div>'
	);

	$.ajax({
		url: '/portal/leitor/iniciar',
		type: 'POST',
		dataType: 'json',
		data: {
			idDocumento: config.idDocumento
		},
		success: function(data) {
			if (!data || data.erro) {
				$('#viewerDrmRoot').html(
					'<div class="text-center py-5 text-danger">' +
						'<p class="mb-0">' + (data && data.erro ? data.erro : 'Não foi possível iniciar a leitura DRM.') + '</p>' +
					'</div>'
				);
				return;
			}
			
			if (requestToken !== documentoDRMState.requestToken) {
				return;
			}

			documentoDRMState.idDocumento = config.idDocumento;
			documentoDRMState.tipoDocumento = config.tipoDocumento;
			vincularLayoutColunasEpubDRM();
			vincularTemaEpubDRM();
			
			
			documentoDRMState.totalPaginas = data.totalPaginas || 0;
			documentoDRMState.chave = data.key || null;
			documentoDRMState.zoom = 1;
			documentoDRMState.fontScale = 1;
			documentoDRMState.entrelinha = config.tipoDocumento == '2'
				? carregarPreferenciaEntrelinhaEpubDRM()
				: 'normal';
			
			var paginaInicial = parseInt($('#paginaInicial').val(), 10);
			var paginaFinal = parseInt($('#paginaFinal').val(), 10);
			var totalPaginas = documentoDRMState.totalPaginas || 1;
			
			if (isNaN(paginaInicial) || paginaInicial < 1) {
				paginaInicial = 1;
			}
			if (paginaInicial > totalPaginas) {
				paginaInicial = totalPaginas;
			}
			
			if (isNaN(paginaFinal) || paginaFinal < 1 || paginaFinal > totalPaginas) {
				paginaFinal = totalPaginas;
			}
			if (paginaFinal < paginaInicial) {
				paginaFinal = paginaInicial;
			}
			
			documentoDRMState.paginaInicial = paginaInicial;
			documentoDRMState.paginaFinal = paginaFinal;
			documentoDRMState.paginaAtual = paginaInicial;
			carregarAnotacoesDRM();
			
			atualizarControlesDRM(paginaInicial);
			atualizarZoomDRM();
			atualizarFonteDRM();
			atualizarEntrelinhaEpubDRM();
			
			$('#viewerDrmRoot').html(
				'<div id="viewerDrmStatus" class="text-center py-2 text-muted"></div>' +
				'<div id="viewerDrmContent" class="w-100"></div>'
			);
			
			carregarPaginaDRM(paginaInicial);
			
			if (documentoDRMState.tipoDocumento == '2') {
				carregarIndiceDRM();
			} else {
				limparIndiceDRM();
			}

		},
		error: function(xhr) {
			
			if (requestToken !== documentoDRMState.requestToken) {
				return;
			}

			var mensagem = 'Erro ao iniciar leitura DRM.';
			if (xhr && xhr.responseText) {
				mensagem = xhr.responseText;
			}

			$('#viewerDrmRoot').html(
				'<div class="text-center py-5 text-danger">' +
					'<p class="mb-0">' + mensagem + '</p>' +
				'</div>'
			);
		}
	});
}

function carregarPaginaDRM(numeroPagina, ancora) {

	if (!documentoDRMState.idDocumento || !documentoDRMState.chave || documentoDRMState.carregandoPagina) {
		return;
	}
	fecharMenuSelecaoTextoEpubDRM(true);
	fecharNotaRodapeDRM();

	numeroPagina = normalizarPaginaDRM(numeroPagina);
	documentoDRMState.carregandoPagina = true;
	documentoDRMState.avancoScrollAtivo = false;
	documentoDRMState.ancoraPendente = ancora || null;
	var deveRolarParaInicio = !ancora;

	var requestToken = documentoDRMState.requestToken;

	atualizarControlesDRM(numeroPagina);

	$('#viewerDrmStatus').text('Carregando página ' + numeroPagina + ' de ' + documentoDRMState.totalPaginas + '...');

	buscarPaginaDRM(numeroPagina).then(function(bytes) {
		if (requestToken !== documentoDRMState.requestToken) {
			return;
		}

		documentoDRMState.paginaAtual = numeroPagina;
		documentoDRMState.paginaAtualMeta = buscarIndiceItemPaginaDRM(numeroPagina);
		atualizarIndiceSelecionadoDRM(numeroPagina);
		atualizarPainelAnotacoesDRM();
		renderizarPaginaDRM(bytes, function() {
			if (requestToken !== documentoDRMState.requestToken) {
				return;
			}

			documentoDRMState.carregandoPagina = false;
			atualizarControlesDRM(numeroPagina);
			prepararAvancoPorScrollDRM(deveRolarParaInicio);
		});
		$('#viewerDrmStatus').text('Página ' + numeroPagina + ' de ' + documentoDRMState.totalPaginas);
	}).catch(function(error) {
		if (requestToken !== documentoDRMState.requestToken) {
			return;
		}

		documentoDRMState.carregandoPagina = false;
		atualizarControlesDRM(documentoDRMState.paginaAtual);
		$('#viewerDrmContent').html(
			'<div class="text-center py-5 text-danger">' +
				'<p class="mb-0">' + (error && error.message ? error.message : 'Erro ao carregar página DRM.') + '</p>' +
			'</div>'
		);
	});
}

function buscarPaginaDRM(numeroPagina) {
	return fetch('/portal/leitor/pagina?idDocumento=' + encodeURIComponent(documentoDRMState.idDocumento) + '&pagina=' + numeroPagina, {
		method: 'GET',
		cache: 'no-store',
		credentials: 'same-origin'
	}).then(function(response) {
		if (!response.ok) {
			throw new Error('Erro ao buscar página DRM (' + response.status + ')');
		}
		return response.arrayBuffer();
	}).then(function(buffer) {
		return descriptografarPaginaDRM(buffer, documentoDRMState.chave);
	});
}

function descriptografarPaginaDRM(buffer, chaveBase64) {
	if (!window.crypto || !window.crypto.subtle) {
		return Promise.reject(new Error('Web Crypto API não disponível neste navegador.'));
	}

	var payload = new Uint8Array(buffer);
	var iv = payload.slice(0, 12);
	var cipherText = payload.slice(12);
	var keyBytes = base64ToUint8Array(chaveBase64);

	return window.crypto.subtle.importKey(
		'raw',
		keyBytes,
		{ name: 'AES-GCM' },
		false,
		['decrypt']
	).then(function(cryptoKey) {
		return window.crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: iv,
				tagLength: 128
			},
			cryptoKey,
			cipherText
		);
	}).then(function(plainBuffer) {
		return new Uint8Array(plainBuffer);
	});
}

function base64ToUint8Array(base64) {
	var binary = atob(base64);
	var bytes = new Uint8Array(binary.length);

	for (var i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	return bytes;
}

function renderizarPaginaDRM(bytes, callback) {
	var aoRenderizar = typeof callback === 'function' ? callback : function() {};

	if ($('#viewerDrmContent').length == 0) {
		aoRenderizar();
		return;
	}

	if (documentoDRMState.objectUrl) {
		URL.revokeObjectURL(documentoDRMState.objectUrl);
		documentoDRMState.objectUrl = null;
	}

	if (documentoDRMState.tipoDocumento == '1') {
		var blob = new Blob([bytes], { type: 'image/png' });
		var imageUrl = URL.createObjectURL(blob);
		documentoDRMState.objectUrl = imageUrl;

		$('#viewerDrmContent').html(
			'<div class="text-center">' +
				'<img id="viewerDrmImage" style="display:block;margin:0 auto;" />' +
			'</div>'
		);

		$('#viewerDrmImage')
			.one('load', function() {
				aplicarZoomDRM();
				aoRenderizar();
			})
			.one('error', aoRenderizar)
			.attr('src', imageUrl);
	} else {
		var html = new TextDecoder('utf-8').decode(bytes);

		$('#viewerDrmContent').html(
			'<iframe id="viewerDrmFrame" style="width:100%;min-height:70vh;border:0;border-radius:12px;"></iframe>'
		);

		var frame = document.getElementById('viewerDrmFrame');

		frame.onload = function() {
			aplicarTemaLeituraEpubDRM(frame);
			aplicarEntrelinhaEpubDRM(frame);
			aplicarLayoutColunasEpubDRM(frame);
			aplicarFonteDRM();
			aplicarZoomDRM();
			ajustarAlturaFrameDRM();
			vincularSelecaoTextoEpubDRM(frame);
			bindLinksInternosFrameDRM(frame);
			aplicarAncoraPendenteDRM(frame);
			aplicarMarcacoesEpubDRM(frame);
			focarAnotacaoPendenteEpubDRM(frame);
			aoRenderizar();
		};

		frame.srcdoc = html;
	}
}

function atualizarControlesDRM(numeroPagina) {
	var paginaInicial = documentoDRMState.paginaInicial || 1;
	var paginaFinal = documentoDRMState.paginaFinal || documentoDRMState.totalPaginas || 1;

	if ($('#drmPaginaAtualInput').length > 0) {
		$('#drmPaginaAtualInput').val(numeroPagina);
		$('#drmPaginaAtualInput').attr('min', paginaInicial);
		$('#drmPaginaAtualInput').attr('max', paginaFinal);
	}

	if ($('#drmPaginaInfo').length > 0) {
		$('#drmPaginaInfo').text(paginaFinal);
	}

	$('#btnDrmAnterior, #btnDrmLateralAnterior').prop(
		'disabled',
		documentoDRMState.carregandoPagina || numeroPagina <= paginaInicial
	);

	$('#btnDrmProxima, #btnDrmLateralProxima').prop(
		'disabled',
		documentoDRMState.carregandoPagina || numeroPagina >= paginaFinal
	);
}

function vincularControlesAnotacoesDRM() {
	$('#btnDrmAnotacoesViewer')
		.off('click.documentoDRMAnnotations')
		.on('click.documentoDRMAnnotations', function() {
			abrirPainelAnotacoesDRM();
		});

	$('#btnDrmFecharAnotacoes, #drmAnnotationBackdrop')
		.off('click.documentoDRMAnnotations')
		.on('click.documentoDRMAnnotations', function() {
			fecharPainelAnotacoesDRM(true);
		});

	$('#btnDrmNovaAnotacao')
		.off('click.documentoDRMAnnotations')
		.on('click.documentoDRMAnnotations', function() {
			abrirFormularioAnotacaoDRM(null);
		});

	$('#btnDrmCancelarAnotacao, #btnDrmCancelarAnotacaoTopo')
		.off('click.documentoDRMAnnotations')
		.on('click.documentoDRMAnnotations', function() {
			fecharFormularioAnotacaoDRM(true);
		});

	$('#btnDrmSalvarAnotacao')
		.off('click.documentoDRMAnnotations')
		.on('click.documentoDRMAnnotations', salvarAnotacaoDRM);

	$('#drmAnnotationText')
		.off('keydown.documentoDRMAnnotations')
		.on('keydown.documentoDRMAnnotations', function(event) {
			if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
				event.preventDefault();
				salvarAnotacaoDRM();
			}
		});

	$('.viewer-annotation-filter [data-annotation-filter]')
		.off('click.documentoDRMAnnotations')
		.on('click.documentoDRMAnnotations', function() {
			documentoDRMState.anotacaoFiltro = $(this).attr('data-annotation-filter') === 'all' ? 'all' : 'page';
			atualizarPainelAnotacoesDRM();
		});

	$('.viewer-annotation-color')
		.off('click.documentoDRMAnnotations')
		.on('click.documentoDRMAnnotations', function() {
			selecionarCorAnotacaoDRM($(this).attr('data-annotation-color'));
		});

	$('.viewer-text-selection-color')
		.off('click.documentoDRMTextSelection')
		.on('click.documentoDRMTextSelection', function(event) {
			event.preventDefault();
			event.stopPropagation();
			selecionarCorSelecaoEpubDRM($(this).attr('data-selection-color'));
		});

	$('#btnDrmMarcarSelecao')
		.off('click.documentoDRMTextSelection')
		.on('click.documentoDRMTextSelection', function(event) {
			event.preventDefault();
			event.stopPropagation();
			salvarMarcacaoEpubDRM();
		});

	$('#btnDrmAnotarSelecao')
		.off('click.documentoDRMTextSelection')
		.on('click.documentoDRMTextSelection', function(event) {
			event.preventDefault();
			event.stopPropagation();
			anotarSelecaoEpubDRM();
		});

	$('#drmAnnotationList')
		.off('click.documentoDRMAnnotations')
		.on('click.documentoDRMAnnotations', '[data-annotation-action]', function() {
			var acao = $(this).attr('data-annotation-action');
			var id = parseInt($(this).attr('data-annotation-id'), 10);
			var anotacao = buscarAnotacaoDRM(id);

			if (!anotacao) {
				return;
			}

			if (acao === 'goto') {
				irParaAnotacaoDRM(anotacao);
			} else if (acao === 'edit') {
				abrirFormularioAnotacaoDRM(anotacao);
			} else if (acao === 'delete') {
				excluirAnotacaoDRM(anotacao, $(this));
			}
		});

	$(document)
		.off('mousedown.documentoDRMTextSelection')
		.on('mousedown.documentoDRMTextSelection', function(event) {
			if ($(event.target).closest('#drmEpubSelectionMenu').length === 0) {
				fecharMenuSelecaoTextoEpubDRM(true);
			}
		})
		.off('keydown.documentoDRMAnnotations')
		.on('keydown.documentoDRMAnnotations', function(event) {
			if (event.key !== 'Escape' || !$('#drmAnnotationPanel').hasClass('is-open')) {
				return;
			}

			if ($('#drmAnnotationForm').is(':visible')) {
				fecharFormularioAnotacaoDRM(true);
			} else {
				fecharPainelAnotacoesDRM(true);
			}
		});

	$(window)
		.off('resize.documentoDRMTextSelection scroll.documentoDRMTextSelection')
		.on('resize.documentoDRMTextSelection scroll.documentoDRMTextSelection', function() {
			fecharMenuSelecaoTextoEpubDRM(true);
		});
}

function abrirPainelAnotacoesDRM() {
	if (!documentoDRMState.idDocumento) {
		return;
	}

	documentoDRMState.anotacaoFiltro = 'page';
	fecharFormularioAnotacaoDRM(false);
	atualizarPainelAnotacoesDRM();
	$('#drmAnnotationBackdrop').addClass('is-open').attr('aria-hidden', 'false');
	$('#drmAnnotationPanel').addClass('is-open').attr('aria-hidden', 'false');
	$('#btnDrmAnotacoesViewer').attr('aria-expanded', 'true');
	$('body').addClass('drm-annotation-open');

	if (!documentoDRMState.anotacoesCarregadas && !documentoDRMState.anotacoesCarregando) {
		carregarAnotacoesDRM();
	}

	setTimeout(function() {
		$('#btnDrmFecharAnotacoes').focus();
	}, 230);
}

function fecharPainelAnotacoesDRM(devolverFoco) {
	fecharFormularioAnotacaoDRM(false);
	$('#drmAnnotationBackdrop').removeClass('is-open').attr('aria-hidden', 'true');
	$('#drmAnnotationPanel').removeClass('is-open').attr('aria-hidden', 'true');
	$('#btnDrmAnotacoesViewer').attr('aria-expanded', 'false');
	$('body').removeClass('drm-annotation-open');

	if (devolverFoco && $('#btnDrmAnotacoesViewer').length) {
		$('#btnDrmAnotacoesViewer').focus();
	}
}

function carregarAnotacoesDRM() {
	if (!documentoDRMState.idDocumento || documentoDRMState.anotacoesCarregando) {
		return;
	}

	var requestToken = documentoDRMState.requestToken;
	var idDocumento = documentoDRMState.idDocumento;
	documentoDRMState.anotacoesCarregando = true;
	mostrarStatusAnotacoesDRM('Carregando suas anotações...', false);

	$.ajax({
		url: '/portal/leitor/anotacoes',
		type: 'GET',
		dataType: 'json',
		cache: false,
		data: {
			idDocumento: idDocumento
		},
		success: function(data) {
			if (requestToken !== documentoDRMState.requestToken || idDocumento !== documentoDRMState.idDocumento) {
				return;
			}

			documentoDRMState.anotacoesCarregando = false;
			if (!data || data.status !== 0) {
				mostrarStatusAnotacoesDRM(data && data.message ? data.message : 'Não foi possível carregar as anotações.', true);
				return;
			}

			documentoDRMState.anotacoes = $.isArray(data.anotacoes) ? data.anotacoes : [];
			documentoDRMState.anotacoesCarregadas = true;
			mostrarStatusAnotacoesDRM('', false);
			atualizarPainelAnotacoesDRM();
			aplicarMarcacoesEpubDRM();
			focarAnotacaoPendenteEpubDRM();
		},
		error: function(xhr) {
			if (requestToken !== documentoDRMState.requestToken || idDocumento !== documentoDRMState.idDocumento) {
				return;
			}

			documentoDRMState.anotacoesCarregando = false;
			mostrarStatusAnotacoesDRM(obterMensagemErroAnotacaoDRM(xhr, 'Não foi possível carregar as anotações.'), true);
		}
	});
}

function atualizarPainelAnotacoesDRM() {
	var paginaAtual = documentoDRMState.paginaAtual || 1;
	$('#drmAnnotationPageLabel').text('Página ' + paginaAtual);
	$('#drmAnnotationFormPage').text(paginaAtual);

	$('.viewer-annotation-filter [data-annotation-filter]').each(function() {
		var ativo = $(this).attr('data-annotation-filter') === documentoDRMState.anotacaoFiltro;
		$(this).toggleClass('active', ativo).attr('aria-pressed', ativo ? 'true' : 'false');
	});

	atualizarContadorAnotacoesDRM();
	renderizarListaAnotacoesDRM();
}

function atualizarContadorAnotacoesDRM() {
	var paginaAtual = parseInt(documentoDRMState.paginaAtual, 10);
	var totalPagina = 0;

	for (var i = 0; i < documentoDRMState.anotacoes.length; i++) {
		if (parseInt(documentoDRMState.anotacoes[i].pagina, 10) === paginaAtual) {
			totalPagina++;
		}
	}

	$('#drmAnnotationCount').text(totalPagina).toggle(totalPagina > 0);
	$('#btnDrmAnotacoesViewer').attr('title', totalPagina > 0
		? totalPagina + (totalPagina === 1 ? ' anotação nesta página' : ' anotações nesta página')
		: 'Anotações');
}

function renderizarListaAnotacoesDRM() {
	var $lista = $('#drmAnnotationList');
	if (!$lista.length) {
		return;
	}

	if (documentoDRMState.anotacoesCarregando) {
		$lista.html('');
		return;
	}

	var paginaAtual = parseInt(documentoDRMState.paginaAtual, 10);
	var anotacoes = [];
	for (var i = 0; i < documentoDRMState.anotacoes.length; i++) {
		var item = documentoDRMState.anotacoes[i];
		if (documentoDRMState.anotacaoFiltro === 'all' || parseInt(item.pagina, 10) === paginaAtual) {
			anotacoes.push(item);
		}
	}

	if (anotacoes.length === 0) {
		var complemento = documentoDRMState.anotacaoFiltro === 'all'
			? 'Você ainda não registrou anotações neste material.'
			: 'Use "Nova anotação" para registrar algo sobre esta página.';
		$lista.html(
			'<div class="viewer-annotation-empty">' +
				'<i class="far fa-sticky-note" aria-hidden="true"></i>' +
				'<strong>Nenhuma anotação por aqui</strong>' +
				'<span>' + complemento + '</span>' +
			'</div>'
		);
		return;
	}

	var html = '';
	for (var j = 0; j < anotacoes.length; j++) {
		html += montarCardAnotacaoDRM(anotacoes[j]);
	}
	$lista.html(html);
}

function montarCardAnotacaoDRM(anotacao) {
	var id = parseInt(anotacao.id, 10);
	var pagina = parseInt(anotacao.pagina, 10);
	var tipoMarcacao = anotacao.tipoBlocoNota === 'M';
	var cor = normalizarCorAnotacaoClienteDRM(anotacao.cor);
	var descricao = anotacao.descricao || '';
	var textoSelecionado = anotacao.textoSelecionado || '';
	var dataAlteracao = anotacao.dataAlteracao || '';
	var html = '<article class="viewer-annotation-card annotation-color-' + cor + '" data-annotation-card-id="' + id + '">';

	html += '<div class="viewer-annotation-card-header">' +
		'<span class="viewer-annotation-card-type"><i class="fas ' + (tipoMarcacao ? 'fa-highlighter' : 'fa-pen') + '" aria-hidden="true"></i>' + (tipoMarcacao ? 'Marcação' : 'Anotação') + '</span>' +
		'<span class="viewer-annotation-card-page">Página ' + pagina + '</span>' +
	'</div>';

	if (textoSelecionado) {
		html += '<blockquote class="viewer-annotation-card-quote">"' + escaparHtmlAnotacaoDRM(textoSelecionado) + '"</blockquote>';
	}

	html += '<p class="viewer-annotation-card-text">' +
		(descricao ? escaparHtmlAnotacaoDRM(descricao) : (tipoMarcacao ? 'Trecho marcado sem comentário.' : 'Anotação sem texto.')) +
	'</p>';
	html += '<div class="viewer-annotation-card-footer">' +
		'<span class="viewer-annotation-card-date">' + escaparHtmlAnotacaoDRM(dataAlteracao) + '</span>' +
		'<div class="viewer-annotation-card-buttons">';

	html += '<button type="button" class="btn" data-annotation-action="goto" data-annotation-id="' + id + '" aria-label="Ir para a página ' + pagina + '" title="Ir para a página"><i class="fas fa-book-open" aria-hidden="true"></i></button>';
	if (!tipoMarcacao) {
		html += '<button type="button" class="btn" data-annotation-action="edit" data-annotation-id="' + id + '" aria-label="Editar anotação" title="Editar"><i class="fas fa-pencil-alt" aria-hidden="true"></i></button>';
	}
	html += '<button type="button" class="btn viewer-annotation-delete" data-annotation-action="delete" data-annotation-id="' + id + '" aria-label="Excluir anotação" title="Excluir"><i class="fas fa-trash-alt" aria-hidden="true"></i></button>' +
		'</div></div></article>';

	return html;
}

function abrirFormularioAnotacaoDRM(anotacao) {
	if (!documentoDRMState.idDocumento) {
		return;
	}

	if (anotacao && anotacao.tipoBlocoNota === 'M') {
		return;
	}

	var anotacaoExistente = !!(anotacao && anotacao.id);
	documentoDRMState.anotacaoEditando = anotacao || null;
	var pagina = anotacao ? parseInt(anotacao.pagina, 10) : documentoDRMState.paginaAtual;
	if (isNaN(pagina)) {
		pagina = documentoDRMState.paginaAtual;
	}
	var cor = normalizarCorAnotacaoClienteDRM(anotacao ? anotacao.cor : 'amarelo');
	var textoSelecionado = anotacao && anotacao.textoSelecionado ? anotacao.textoSelecionado : '';

	$('#drmAnnotationId').val(anotacaoExistente ? anotacao.id : '');
	$('#drmAnnotationFormMode').text(anotacaoExistente ? 'Editar anotação' : 'Nova anotação');
	$('#drmAnnotationFormPage').text(pagina);
	$('#drmAnnotationText').val(anotacao && anotacao.descricao ? anotacao.descricao : '');
	$('#drmAnnotationSelectionPreview').text(textoSelecionado).toggle(textoSelecionado.length > 0);
	mostrarStatusFormularioAnotacaoDRM('', false);
	selecionarCorAnotacaoDRM(cor);
	$('#drmAnnotationPanel').addClass('is-form-open');
	$('#drmAnnotationList').attr('aria-hidden', 'true').prop('inert', true);
	$('#drmAnnotationForm').show();
	$('#drmAnnotationPanel .viewer-annotation-body').scrollTop(0);
	setTimeout(function() {
		$('#drmAnnotationText').focus();
	}, 0);
}

function fecharFormularioAnotacaoDRM(devolverFoco) {
	documentoDRMState.anotacaoEditando = null;
	$('#drmAnnotationForm').hide();
	$('#drmAnnotationPanel').removeClass('is-form-open');
	$('#drmAnnotationList').attr('aria-hidden', 'false').prop('inert', false);
	$('#drmAnnotationId').val('');
	$('#drmAnnotationText').val('');
	$('#drmAnnotationSelectionPreview').hide().text('');
	mostrarStatusFormularioAnotacaoDRM('', false);
	setSalvandoAnotacaoDRM(false);

	if (devolverFoco && $('#drmAnnotationPanel').hasClass('is-open')) {
		$('#btnDrmNovaAnotacao').focus();
	}
}

function salvarAnotacaoDRM() {
	if (!documentoDRMState.idDocumento || $('#btnDrmSalvarAnotacao').prop('disabled')) {
		return;
	}

	var anotacaoAtual = documentoDRMState.anotacaoEditando;
	var anotacaoExistente = !!(anotacaoAtual && anotacaoAtual.id);
	var pagina = anotacaoAtual ? parseInt(anotacaoAtual.pagina, 10) : parseInt(documentoDRMState.paginaAtual, 10);
	var descricao = $.trim($('#drmAnnotationText').val() || '');
	if (!descricao) {
		mostrarStatusFormularioAnotacaoDRM('Escreva o texto da anotação antes de salvar.', true);
		$('#drmAnnotationText').focus();
		return;
	}

	var ancora = anotacaoAtual && anotacaoAtual.ancora
		? anotacaoAtual.ancora
		: JSON.stringify({ type: 'page', page: pagina });
	var payload = {
		idDocumento: documentoDRMState.idDocumento,
		id: anotacaoExistente ? anotacaoAtual.id : '',
		pagina: pagina,
		tipo: anotacaoAtual && anotacaoAtual.tipoBlocoNota ? anotacaoAtual.tipoBlocoNota : 'N',
		ancora: ancora,
		descricao: descricao,
		textoSelecionado: anotacaoAtual && anotacaoAtual.textoSelecionado ? anotacaoAtual.textoSelecionado : '',
		cor: documentoDRMState.anotacaoCor
	};

	setSalvandoAnotacaoDRM(true);
	mostrarStatusFormularioAnotacaoDRM('', false);
	$.ajax({
		url: '/portal/leitor/anotacao/salvar',
		type: 'POST',
		dataType: 'json',
		data: payload,
		success: function(data) {
			if (!data || data.status !== 0 || !data.anotacao) {
				setSalvandoAnotacaoDRM(false);
				mostrarStatusFormularioAnotacaoDRM(data && data.message ? data.message : 'Não foi possível salvar a anotação.', true);
				return;
			}

			adicionarOuAtualizarAnotacaoDRM(data.anotacao);
			fecharFormularioAnotacaoDRM(false);
			atualizarPainelAnotacoesDRM();
			aplicarMarcacoesEpubDRM();
			mostrarStatusAnotacoesDRM(anotacaoExistente ? 'Anotação atualizada.' : 'Anotação salva.', false);
		},
		error: function(xhr) {
			setSalvandoAnotacaoDRM(false);
			mostrarStatusFormularioAnotacaoDRM(obterMensagemErroAnotacaoDRM(xhr, 'Não foi possível salvar a anotação.'), true);
		}
	});
}

function excluirAnotacaoDRM(anotacao, $botao) {
	if (!anotacao || !window.confirm('Deseja excluir esta anotação?')) {
		return;
	}

	$botao.prop('disabled', true);
	$.ajax({
		url: '/portal/leitor/anotacao/excluir',
		type: 'POST',
		dataType: 'json',
		data: {
			idDocumento: documentoDRMState.idDocumento,
			id: anotacao.id
		},
		success: function(data) {
			if (!data || data.status !== 0) {
				$botao.prop('disabled', false);
				mostrarStatusAnotacoesDRM(data && data.message ? data.message : 'Não foi possível excluir a anotação.', true);
				return;
			}

			var restantes = [];
			for (var i = 0; i < documentoDRMState.anotacoes.length; i++) {
				if (parseInt(documentoDRMState.anotacoes[i].id, 10) !== parseInt(anotacao.id, 10)) {
					restantes.push(documentoDRMState.anotacoes[i]);
				}
			}
			documentoDRMState.anotacoes = restantes;
			atualizarPainelAnotacoesDRM();
			aplicarMarcacoesEpubDRM();
			mostrarStatusAnotacoesDRM('Anotação excluída.', false);
		},
		error: function(xhr) {
			$botao.prop('disabled', false);
			mostrarStatusAnotacoesDRM(obterMensagemErroAnotacaoDRM(xhr, 'Não foi possível excluir a anotação.'), true);
		}
	});
}

function irParaAnotacaoDRM(anotacao) {
	var pagina = normalizarPaginaDRM(parseInt(anotacao.pagina, 10));
	var destacar = isAncoraTextoAnotacaoDRM(anotacao);
	fecharPainelAnotacoesDRM(false);
	if (pagina !== documentoDRMState.paginaAtual && !documentoDRMState.carregandoPagina) {
		documentoDRMState.anotacaoFocoPendente = destacar ? parseInt(anotacao.id, 10) : null;
		carregarPaginaDRM(pagina);
	} else if (destacar) {
		focarAnotacaoEpubDRM(parseInt(anotacao.id, 10));
	}
}

function buscarAnotacaoDRM(id) {
	for (var i = 0; i < documentoDRMState.anotacoes.length; i++) {
		if (parseInt(documentoDRMState.anotacoes[i].id, 10) === parseInt(id, 10)) {
			return documentoDRMState.anotacoes[i];
		}
	}
	return null;
}

function adicionarOuAtualizarAnotacaoDRM(anotacao) {
	for (var i = 0; i < documentoDRMState.anotacoes.length; i++) {
		if (parseInt(documentoDRMState.anotacoes[i].id, 10) === parseInt(anotacao.id, 10)) {
			documentoDRMState.anotacoes[i] = anotacao;
			return;
		}
	}
	documentoDRMState.anotacoes.push(anotacao);
}

function selecionarCorAnotacaoDRM(cor) {
	cor = normalizarCorAnotacaoClienteDRM(cor);
	documentoDRMState.anotacaoCor = cor;
	$('.viewer-annotation-color').each(function() {
		var ativo = $(this).attr('data-annotation-color') === cor;
		$(this).toggleClass('active', ativo).attr('aria-pressed', ativo ? 'true' : 'false');
	});
}

function normalizarCorAnotacaoClienteDRM(cor) {
	return cor === 'verde' || cor === 'azul' || cor === 'rosa' ? cor : 'amarelo';
}

function mostrarStatusAnotacoesDRM(mensagem, erro) {
	var $status = $('#drmAnnotationStatus');
	$status.text(mensagem || '').toggleClass('is-visible', !!mensagem).toggleClass('is-error', !!erro);
}

function mostrarStatusFormularioAnotacaoDRM(mensagem, erro) {
	var $status = $('#drmAnnotationFormStatus');
	$status.text(mensagem || '').toggleClass('is-visible', !!mensagem).toggleClass('is-error', !!erro);
}

function setSalvandoAnotacaoDRM(salvando) {
	$('#btnDrmSalvarAnotacao').prop('disabled', salvando);
	$('#btnDrmSalvarAnotacao .viewer-annotation-save-label').toggle(!salvando);
	$('#btnDrmSalvarAnotacao .viewer-annotation-save-loading').toggle(salvando);
}

function obterMensagemErroAnotacaoDRM(xhr, mensagemPadrao) {
	if (xhr && xhr.responseJSON && xhr.responseJSON.message) {
		return xhr.responseJSON.message;
	}
	if (xhr && xhr.responseText) {
		try {
			var resposta = JSON.parse(xhr.responseText);
			if (resposta && resposta.message) {
				return resposta.message;
			}
		} catch (e) {
			// Mantém a mensagem amigável quando a resposta não for JSON.
		}
	}
	return mensagemPadrao;
}

function escaparHtmlAnotacaoDRM(valor) {
	return $('<div>').text(valor == null ? '' : String(valor)).html();
}

function vincularSelecaoTextoEpubDRM(frame) {
	if (documentoDRMState.tipoDocumento != '2' || !frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	if (!doc.body || doc._drmTextSelectionBound) {
		return;
	}
	doc._drmTextSelectionBound = true;

	var atualizarSelecao = function() {
		setTimeout(function() {
			capturarSelecaoTextoEpubDRM(frame);
		}, 0);
	};

	doc.addEventListener('mousedown', function() {
		fecharMenuSelecaoTextoEpubDRM(true);
	}, true);
	doc.addEventListener('mouseup', atualizarSelecao, true);
	doc.addEventListener('keyup', atualizarSelecao, true);
	doc.addEventListener('touchend', function() {
		setTimeout(function() {
			capturarSelecaoTextoEpubDRM(frame);
		}, 180);
	}, true);
	doc.addEventListener('scroll', function() {
		fecharMenuSelecaoTextoEpubDRM(true);
	}, true);
	doc.addEventListener('click', function(event) {
		var alvo = event.target;
		if (!alvo || typeof alvo.closest !== 'function') {
			return;
		}
		var destaque = alvo.closest('mark.tutor-drm-highlight');
		if (!destaque) {
			return;
		}

		var id = parseInt(destaque.getAttribute('data-annotation-id'), 10);
		if (isNaN(id)) {
			return;
		}
		event.preventDefault();
		event.stopImmediatePropagation();
		abrirAnotacaoSelecionadaEpubDRM(id);
	}, true);
}

function capturarSelecaoTextoEpubDRM(frame) {
	if (documentoDRMState.tipoDocumento != '2' || !frame || !frame.contentWindow) {
		fecharMenuSelecaoTextoEpubDRM(true);
		return;
	}

	var selecao = frame.contentWindow.getSelection ? frame.contentWindow.getSelection() : null;
	if (!selecao || selecao.rangeCount === 0 || selecao.isCollapsed) {
		fecharMenuSelecaoTextoEpubDRM(true);
		return;
	}

	var range = selecao.getRangeAt(0).cloneRange();
	var doc = frame.contentWindow.document;
	var textoOriginal = range.toString();
	var textoSelecionado = $.trim(textoOriginal);
	if (!textoSelecionado || textoSelecionado.length < 2 || textoOriginal.length > 5000
			|| !doc.body.contains(range.commonAncestorContainer)
			|| rangeIntersectsDestaqueEpubDRM(range, doc)) {
		fecharMenuSelecaoTextoEpubDRM(true);
		return;
	}

	var ancora = criarAncoraSelecaoEpubDRM(range, doc, textoOriginal);
	if (!ancora) {
		fecharMenuSelecaoTextoEpubDRM(true);
		return;
	}

	documentoDRMState.selecaoEpub = {
		pagina: documentoDRMState.paginaAtual,
		texto: textoSelecionado,
		ancora: JSON.stringify(ancora)
	};
	selecionarCorSelecaoEpubDRM(documentoDRMState.selecaoEpubCor);
	posicionarMenuSelecaoTextoEpubDRM(frame, range);
}

function rangeIntersectsDestaqueEpubDRM(range, doc) {
	var destaques = doc.querySelectorAll('mark.tutor-drm-highlight');
	for (var i = 0; i < destaques.length; i++) {
		try {
			if (range.intersectsNode(destaques[i])) {
				return true;
			}
		} catch (e) {
			if (destaques[i].contains(range.startContainer) || destaques[i].contains(range.endContainer)) {
				return true;
			}
		}
	}
	return false;
}

function criarAncoraSelecaoEpubDRM(range, doc, textoOriginal) {
	var mapa = mapearTextoEpubDRM(doc);
	var inicio = buscarPosicaoNoMapaEpubDRM(mapa, range.startContainer, range.startOffset);
	var fim = buscarPosicaoNoMapaEpubDRM(mapa, range.endContainer, range.endOffset);
	if (inicio == null || fim == null || fim <= inicio) {
		return null;
	}

	return {
		version: 1,
		type: 'text',
		start: {
			path: criarCaminhoNoEpubDRM(range.startContainer, doc.body),
			offset: range.startOffset
		},
		end: {
			path: criarCaminhoNoEpubDRM(range.endContainer, doc.body),
			offset: range.endOffset
		},
		textPosition: {
			start: inicio,
			end: fim
		},
		textQuote: {
			exact: textoOriginal,
			prefix: mapa.text.substring(Math.max(0, inicio - 48), inicio),
			suffix: mapa.text.substring(fim, Math.min(mapa.text.length, fim + 48))
		},
		source: documentoDRMState.paginaAtualMeta && documentoDRMState.paginaAtualMeta.source
			? documentoDRMState.paginaAtualMeta.source
			: ''
	};
}

function mapearTextoEpubDRM(doc) {
	var entradas = [];
	var texto = '';
	if (!doc || !doc.body) {
		return { entries: entradas, text: texto };
	}

	var win = doc.defaultView || window;
	var nodeFilter = win.NodeFilter || window.NodeFilter;
	if (!nodeFilter) {
		return { entries: entradas, text: texto };
	}
	var walker = doc.createTreeWalker(doc.body, nodeFilter.SHOW_TEXT, {
		acceptNode: function(node) {
			return isNoTextoValidoEpubDRM(node)
				? nodeFilter.FILTER_ACCEPT
				: nodeFilter.FILTER_REJECT;
		}
	});
	var node = walker.nextNode();
	while (node) {
		var valor = node.nodeValue || '';
		entradas.push({ node: node, start: texto.length, end: texto.length + valor.length });
		texto += valor;
		node = walker.nextNode();
	}
	return { entries: entradas, text: texto };
}

function isNoTextoValidoEpubDRM(node) {
	var parent = node && node.parentElement;
	if (!parent || typeof parent.closest !== 'function') {
		return false;
	}
	return !parent.closest('script, style, noscript, .tutor-drm-watermark');
}

function buscarPosicaoNoMapaEpubDRM(mapa, node, offset) {
	if (!node || node.nodeType !== 3) {
		return null;
	}
	for (var i = 0; i < mapa.entries.length; i++) {
		if (mapa.entries[i].node === node) {
			return mapa.entries[i].start + Math.max(0, Math.min(offset, (node.nodeValue || '').length));
		}
	}
	return null;
}

function criarCaminhoNoEpubDRM(node, raiz) {
	var caminho = [];
	var atual = node;
	while (atual && atual !== raiz) {
		var parent = atual.parentNode;
		if (!parent) {
			return [];
		}
		var indice = 0;
		while (indice < parent.childNodes.length && parent.childNodes[indice] !== atual) {
			indice++;
		}
		if (indice >= parent.childNodes.length) {
			return [];
		}
		caminho.unshift(indice);
		atual = parent;
	}
	return atual === raiz ? caminho : [];
}

function posicionarMenuSelecaoTextoEpubDRM(frame, range) {
	var rects = range.getClientRects();
	var rect = null;
	for (var i = rects.length - 1; i >= 0; i--) {
		if (rects[i].width || rects[i].height) {
			rect = rects[i];
			break;
		}
	}
	if (!rect) {
		rect = range.getBoundingClientRect();
	}
	if (!rect) {
		return;
	}

	var frameRect = frame.getBoundingClientRect();
	var $menu = $('#drmEpubSelectionMenu');
	var esquerda = frameRect.left + rect.left + (rect.width / 2);
	var topo = frameRect.top + rect.top;
	var abaixo = topo < 78;
	if (abaixo) {
		topo = frameRect.top + rect.bottom;
	}

	$menu
		.toggleClass('is-below', abaixo)
		.css({ left: esquerda + 'px', top: topo + 'px' })
		.addClass('is-open')
		.attr('aria-hidden', 'false');

	setTimeout(function() {
		var largura = $menu.outerWidth() || 260;
		var margem = 9;
		var metade = largura / 2;
		var esquerdaAjustada = Math.max(metade + margem, Math.min(window.innerWidth - metade - margem, esquerda));
		$menu.css('left', esquerdaAjustada + 'px');
	}, 0);
}

function selecionarCorSelecaoEpubDRM(cor) {
	cor = normalizarCorAnotacaoClienteDRM(cor);
	documentoDRMState.selecaoEpubCor = cor;
	$('.viewer-text-selection-color').each(function() {
		var ativo = $(this).attr('data-selection-color') === cor;
		$(this).toggleClass('active', ativo).attr('aria-pressed', ativo ? 'true' : 'false');
	});
}

function fecharMenuSelecaoTextoEpubDRM(limparSelecao) {
	$('#drmEpubSelectionMenu').removeClass('is-open is-below').attr('aria-hidden', 'true');
	setSalvandoSelecaoEpubDRM(false);
	if (limparSelecao) {
		limparSelecaoVisualEpubDRM();
	}
}

function limparSelecaoVisualEpubDRM() {
	var frame = document.getElementById('viewerDrmFrame');
	if (frame && frame.contentWindow && frame.contentWindow.getSelection) {
		var selecao = frame.contentWindow.getSelection();
		if (selecao) {
			selecao.removeAllRanges();
		}
	}
	documentoDRMState.selecaoEpub = null;
}

function salvarMarcacaoEpubDRM() {
	var selecao = documentoDRMState.selecaoEpub;
	if (!selecao || documentoDRMState.tipoDocumento != '2' || $('#btnDrmMarcarSelecao').prop('disabled')) {
		return;
	}

	var requestToken = documentoDRMState.requestToken;
	var idDocumento = documentoDRMState.idDocumento;
	$('#drmEpubSelectionStatus').text('');
	setSalvandoSelecaoEpubDRM(true);
	$.ajax({
		url: '/portal/leitor/anotacao/salvar',
		type: 'POST',
		dataType: 'json',
		data: {
			idDocumento: idDocumento,
			pagina: selecao.pagina,
			tipo: 'M',
			ancora: selecao.ancora,
			descricao: '',
			textoSelecionado: selecao.texto,
			cor: documentoDRMState.selecaoEpubCor
		},
		success: function(data) {
			if (requestToken !== documentoDRMState.requestToken || idDocumento !== documentoDRMState.idDocumento) {
				return;
			}
			if (!data || data.status !== 0 || !data.anotacao) {
				setSalvandoSelecaoEpubDRM(false);
				$('#drmEpubSelectionStatus').text(data && data.message ? data.message : 'Não foi possível marcar o texto.');
				return;
			}

			adicionarOuAtualizarAnotacaoDRM(data.anotacao);
			fecharMenuSelecaoTextoEpubDRM(true);
			atualizarPainelAnotacoesDRM();
			aplicarMarcacoesEpubDRM();
		},
		error: function(xhr) {
			if (requestToken !== documentoDRMState.requestToken || idDocumento !== documentoDRMState.idDocumento) {
				return;
			}
			setSalvandoSelecaoEpubDRM(false);
			$('#drmEpubSelectionStatus').text(obterMensagemErroAnotacaoDRM(xhr, 'Não foi possível marcar o texto.'));
		}
	});
}

function anotarSelecaoEpubDRM() {
	var selecao = documentoDRMState.selecaoEpub;
	if (!selecao || documentoDRMState.tipoDocumento != '2') {
		return;
	}

	var rascunho = {
		id: null,
		pagina: selecao.pagina,
		tipoBlocoNota: 'N',
		ancora: selecao.ancora,
		textoSelecionado: selecao.texto,
		cor: documentoDRMState.selecaoEpubCor,
		descricao: ''
	};
	fecharMenuSelecaoTextoEpubDRM(true);
	abrirPainelAnotacoesDRM();
	abrirFormularioAnotacaoDRM(rascunho);
}

function setSalvandoSelecaoEpubDRM(salvando) {
	$('#btnDrmMarcarSelecao, #btnDrmAnotarSelecao, .viewer-text-selection-color').prop('disabled', salvando);
	$('#btnDrmMarcarSelecao i').attr('class', salvando ? 'fas fa-spinner fa-spin' : 'fas fa-highlighter');
	if (!salvando) {
		$('#drmEpubSelectionStatus').text('');
	}
}

function isAncoraTextoAnotacaoDRM(anotacao) {
	var ancora = parseAncoraAnotacaoDRM(anotacao && anotacao.ancora);
	return !!ancora && ancora.type === 'text';
}

function parseAncoraAnotacaoDRM(ancora) {
	if (!ancora) {
		return null;
	}
	if (typeof ancora === 'object') {
		return ancora;
	}
	try {
		var valor = JSON.parse(ancora);
		return valor && typeof valor === 'object' ? valor : null;
	} catch (e) {
		return null;
	}
}

function aplicarMarcacoesEpubDRM(frame) {
	if (documentoDRMState.tipoDocumento != '2') {
		return;
	}
	frame = frame || document.getElementById('viewerDrmFrame');
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	if (!doc.body) {
		return;
	}
	removerMarcacoesEpubDRM(doc);

	var paginaAtual = parseInt(documentoDRMState.paginaAtual, 10);
	for (var i = 0; i < documentoDRMState.anotacoes.length; i++) {
		var anotacao = documentoDRMState.anotacoes[i];
		if (parseInt(anotacao.pagina, 10) !== paginaAtual || !isAncoraTextoAnotacaoDRM(anotacao)) {
			continue;
		}
		var ancora = parseAncoraAnotacaoDRM(anotacao.ancora);
		var rangeResolvido = resolverAncoraTextoEpubDRM(doc, ancora);
		if (rangeResolvido) {
			envolverTrechosMarcacaoEpubDRM(doc, rangeResolvido.start, rangeResolvido.end, anotacao);
		}
	}
	ajustarAlturaFrameDRM();
}

function removerMarcacoesEpubDRM(doc) {
	var destaques = doc.querySelectorAll('mark.tutor-drm-highlight');
	for (var i = destaques.length - 1; i >= 0; i--) {
		var destaque = destaques[i];
		var parent = destaque.parentNode;
		if (!parent) {
			continue;
		}
		while (destaque.firstChild) {
			parent.insertBefore(destaque.firstChild, destaque);
		}
		parent.removeChild(destaque);
	}
	if (doc.body) {
		doc.body.normalize();
	}
}

function resolverAncoraTextoEpubDRM(doc, ancora) {
	if (!ancora || ancora.type !== 'text') {
		return null;
	}

	var mapa = mapearTextoEpubDRM(doc);
	var exact = ancora.textQuote && typeof ancora.textQuote.exact === 'string' ? ancora.textQuote.exact : '';
	var rangePorCaminho = criarRangePorCaminhoEpubDRM(doc, ancora);
	if (rangePorCaminho && (!exact || rangePorCaminho.range.toString() === exact)) {
		return rangePorCaminho;
	}

	var inicio = ancora.textPosition ? parseInt(ancora.textPosition.start, 10) : NaN;
	var fim = ancora.textPosition ? parseInt(ancora.textPosition.end, 10) : NaN;
	var rangePorPosicao = criarRangePorOffsetsEpubDRM(doc, mapa, inicio, fim);
	if (rangePorPosicao && (!exact || rangePorPosicao.range.toString() === exact)) {
		return rangePorPosicao;
	}

	if (!exact) {
		return rangePorPosicao || rangePorCaminho;
	}
	var posicaoEncontrada = localizarTextoAncoraEpubDRM(mapa.text, exact, ancora.textQuote, inicio);
	return posicaoEncontrada < 0
		? null
		: criarRangePorOffsetsEpubDRM(doc, mapa, posicaoEncontrada, posicaoEncontrada + exact.length);
}

function criarRangePorCaminhoEpubDRM(doc, ancora) {
	var inicio = ancora.start || {};
	var fim = ancora.end || {};
	var nodeInicio = resolverCaminhoNoEpubDRM(doc.body, inicio.path);
	var nodeFim = resolverCaminhoNoEpubDRM(doc.body, fim.path);
	if (!nodeInicio || !nodeFim || nodeInicio.nodeType !== 3 || nodeFim.nodeType !== 3) {
		return null;
	}

	var offsetInicio = parseInt(inicio.offset, 10);
	var offsetFim = parseInt(fim.offset, 10);
	if (isNaN(offsetInicio) || isNaN(offsetFim)
			|| offsetInicio < 0 || offsetFim < 0
			|| offsetInicio > (nodeInicio.nodeValue || '').length
			|| offsetFim > (nodeFim.nodeValue || '').length) {
		return null;
	}

	try {
		var range = doc.createRange();
		range.setStart(nodeInicio, offsetInicio);
		range.setEnd(nodeFim, offsetFim);
		var mapa = mapearTextoEpubDRM(doc);
		var start = buscarPosicaoNoMapaEpubDRM(mapa, nodeInicio, offsetInicio);
		var end = buscarPosicaoNoMapaEpubDRM(mapa, nodeFim, offsetFim);
		return start != null && end != null && end > start ? { range: range, start: start, end: end } : null;
	} catch (e) {
		return null;
	}
}

function resolverCaminhoNoEpubDRM(raiz, caminho) {
	if (!raiz || !$.isArray(caminho)) {
		return null;
	}
	var atual = raiz;
	for (var i = 0; i < caminho.length; i++) {
		var indice = parseInt(caminho[i], 10);
		if (isNaN(indice) || indice < 0 || indice >= atual.childNodes.length) {
			return null;
		}
		atual = atual.childNodes[indice];
	}
	return atual;
}

function criarRangePorOffsetsEpubDRM(doc, mapa, inicio, fim) {
	if (isNaN(inicio) || isNaN(fim) || inicio < 0 || fim <= inicio || fim > mapa.text.length) {
		return null;
	}
	var entradaInicio = null;
	var entradaFim = null;
	for (var i = 0; i < mapa.entries.length; i++) {
		var entrada = mapa.entries[i];
		if (!entradaInicio && inicio >= entrada.start && inicio <= entrada.end) {
			entradaInicio = entrada;
		}
		if (fim >= entrada.start && fim <= entrada.end) {
			entradaFim = entrada;
			break;
		}
	}
	if (!entradaInicio || !entradaFim) {
		return null;
	}

	try {
		var range = doc.createRange();
		range.setStart(entradaInicio.node, inicio - entradaInicio.start);
		range.setEnd(entradaFim.node, fim - entradaFim.start);
		return { range: range, start: inicio, end: fim };
	} catch (e) {
		return null;
	}
}

function localizarTextoAncoraEpubDRM(textoCompleto, exact, textQuote, posicaoOriginal) {
	var melhor = -1;
	var melhorPontuacao = -Infinity;
	var indice = textoCompleto.indexOf(exact);
	while (indice >= 0) {
		var pontuacao = 0;
		if (textQuote && textQuote.prefix && textoCompleto.substring(Math.max(0, indice - textQuote.prefix.length), indice) === textQuote.prefix) {
			pontuacao += 1000;
		}
		var fim = indice + exact.length;
		if (textQuote && textQuote.suffix && textoCompleto.substring(fim, fim + textQuote.suffix.length) === textQuote.suffix) {
			pontuacao += 1000;
		}
		if (!isNaN(posicaoOriginal)) {
			pontuacao -= Math.abs(indice - posicaoOriginal);
		}
		if (pontuacao > melhorPontuacao) {
			melhorPontuacao = pontuacao;
			melhor = indice;
		}
		indice = textoCompleto.indexOf(exact, indice + 1);
	}
	return melhor;
}

function envolverTrechosMarcacaoEpubDRM(doc, inicio, fim, anotacao) {
	var mapa = mapearTextoEpubDRM(doc);
	var cor = normalizarCorAnotacaoClienteDRM(anotacao.cor);
	for (var i = mapa.entries.length - 1; i >= 0; i--) {
		var entrada = mapa.entries[i];
		var inicioLocal = Math.max(0, inicio - entrada.start);
		var fimLocal = Math.min(entrada.end - entrada.start, fim - entrada.start);
		if (fimLocal <= inicioLocal) {
			continue;
		}

		try {
			var range = doc.createRange();
			range.setStart(entrada.node, inicioLocal);
			range.setEnd(entrada.node, fimLocal);
			var mark = doc.createElement('mark');
			mark.className = 'tutor-drm-highlight color-' + cor + (anotacao.tipoBlocoNota === 'N' ? ' is-note' : '');
			mark.setAttribute('data-annotation-id', anotacao.id);
			mark.setAttribute('title', anotacao.tipoBlocoNota === 'N' ? 'Trecho com anotação' : 'Texto marcado');
			range.surroundContents(mark);
		} catch (e) {
			// Um trecho inválido não impede a exibição das demais marcações.
		}
	}
}

function focarAnotacaoPendenteEpubDRM(frame) {
	if (documentoDRMState.anotacaoFocoPendente == null) {
		return;
	}
	if (focarAnotacaoEpubDRM(documentoDRMState.anotacaoFocoPendente, frame)) {
		documentoDRMState.anotacaoFocoPendente = null;
	}
}

function focarAnotacaoEpubDRM(id, frame) {
	frame = frame || document.getElementById('viewerDrmFrame');
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return false;
	}
	var destaques = frame.contentWindow.document.querySelectorAll('mark.tutor-drm-highlight[data-annotation-id="' + parseInt(id, 10) + '"]');
	if (!destaques.length) {
		return false;
	}

	try {
		destaques[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
	} catch (e) {
		destaques[0].scrollIntoView();
	}
	for (var i = 0; i < destaques.length; i++) {
		destaques[i].classList.add('is-focus');
	}
	setTimeout(function() {
		for (var j = 0; j < destaques.length; j++) {
			destaques[j].classList.remove('is-focus');
		}
	}, 1600);
	return true;
}

function abrirAnotacaoSelecionadaEpubDRM(id) {
	fecharMenuSelecaoTextoEpubDRM(true);
	abrirPainelAnotacoesDRM();
	setTimeout(function() {
		var card = $('#drmAnnotationList [data-annotation-card-id="' + parseInt(id, 10) + '"]').get(0);
		if (card && typeof card.scrollIntoView === 'function') {
			card.scrollIntoView({ behavior: 'smooth', block: 'center' });
			$(card).addClass('is-focus');
			setTimeout(function() {
				$(card).removeClass('is-focus');
			}, 1400);
		}
	}, 240);
}

function normalizarPaginaDRM(numeroPagina) {
	var paginaInicial = documentoDRMState.paginaInicial || 1;
	var paginaFinal = documentoDRMState.paginaFinal || documentoDRMState.totalPaginas || paginaInicial;
	var pagina = parseInt(numeroPagina, 10);

	if (isNaN(pagina) || pagina < paginaInicial) {
		pagina = paginaInicial;
	}

	if (pagina > paginaFinal) {
		pagina = paginaFinal;
	}

	return pagina;
}

function navegarPaginaAnteriorDRM() {
	if (documentoDRMState.carregandoPagina || documentoDRMState.paginaAtual <= documentoDRMState.paginaInicial) {
		return;
	}

	carregarPaginaDRM(documentoDRMState.paginaAtual - 1);
}

function navegarProximaPaginaDRM() {
	if (documentoDRMState.carregandoPagina || documentoDRMState.paginaAtual >= documentoDRMState.paginaFinal) {
		return;
	}

	carregarPaginaDRM(documentoDRMState.paginaAtual + 1);
}

function prepararAvancoPorScrollDRM(rolarParaInicio) {
	documentoDRMState.avancoScrollAtivo = false;
	vincularScrollDocumentoDRM();

	if (rolarParaInicio !== false) {
		rolarInicioDocumentoDRM();
	}

	setTimeout(function() {
		if (!documentoDRMState.idDocumento || documentoDRMState.carregandoPagina) {
			return;
		}

		for (var i = 0; i < documentoDRMState.alvosScroll.length; i++) {
			var alvo = documentoDRMState.alvosScroll[i];
			var metricas = obterMetricasScrollDRM(alvo);
			alvo._documentoDRMUltimoScroll = metricas ? metricas.topo : 0;
		}

		documentoDRMState.avancoScrollAtivo = true;
	}, 400);
}

function vincularScrollDocumentoDRM() {
	desvincularScrollDocumentoDRM();

	var alvos = [];
	var root = document.getElementById('viewerDrmRoot');
	var elemento = root ? root.parentElement : null;

	while (elemento && elemento !== document.body && elemento !== document.documentElement) {
		var estilo = window.getComputedStyle ? window.getComputedStyle(elemento) : null;
		var overflowY = estilo ? estilo.overflowY : '';

		if (
			elemento.id === 'modalBodyMedia' ||
			overflowY === 'auto' ||
			overflowY === 'scroll' ||
			overflowY === 'overlay'
		) {
			adicionarAlvoScrollDRM(alvos, elemento);
		}

		elemento = elemento.parentElement;
	}

	adicionarAlvoScrollDRM(alvos, window);

	var frame = document.getElementById('viewerDrmFrame');
	if (frame && frame.contentWindow) {
		adicionarAlvoScrollDRM(alvos, frame.contentWindow);
	}

	documentoDRMState.alvosScroll = alvos;

	for (var i = 0; i < alvos.length; i++) {
		alvos[i].addEventListener('scroll', verificarFinalScrollDRM, { passive: true });
	}
}

function adicionarAlvoScrollDRM(alvos, alvo) {
	if (alvo && typeof alvo.addEventListener === 'function' && alvos.indexOf(alvo) === -1) {
		alvos.push(alvo);
	}
}

function desvincularScrollDocumentoDRM() {
	for (var i = 0; i < documentoDRMState.alvosScroll.length; i++) {
		var alvo = documentoDRMState.alvosScroll[i];
		if (alvo && typeof alvo.removeEventListener === 'function') {
			alvo.removeEventListener('scroll', verificarFinalScrollDRM);
		}
	}

	documentoDRMState.alvosScroll = [];
}

function obterMetricasScrollDRM(alvo) {
	var elementoScroll;

	if (alvo === window) {
		elementoScroll = document.scrollingElement || document.documentElement;
	} else if (alvo && alvo.window === alvo && alvo.document) {
		elementoScroll = alvo.document.scrollingElement || alvo.document.documentElement;
	} else {
		elementoScroll = alvo;
	}

	if (!elementoScroll) {
		return null;
	}

	return {
		topo: elementoScroll.scrollTop || 0,
		alturaVisivel: elementoScroll.clientHeight || 0,
		alturaTotal: elementoScroll.scrollHeight || 0,
		elemento: elementoScroll
	};
}

function verificarFinalScrollDRM(event) {
	var alvo = event.currentTarget;
	var metricas = obterMetricasScrollDRM(alvo);

	if (!metricas) {
		return;
	}

	var ultimoScroll = typeof alvo._documentoDRMUltimoScroll === 'number' ? alvo._documentoDRMUltimoScroll : 0;
	alvo._documentoDRMUltimoScroll = metricas.topo;

	if (
		!documentoDRMState.avancoScrollAtivo ||
		documentoDRMState.carregandoPagina ||
		documentoDRMState.paginaAtual >= documentoDRMState.paginaFinal ||
		metricas.alturaTotal <= metricas.alturaVisivel + 4 ||
		metricas.topo <= ultimoScroll
	) {
		return;
	}

	var distanciaFinal = metricas.alturaTotal - metricas.alturaVisivel - metricas.topo;
	if (distanciaFinal <= 24) {
		documentoDRMState.avancoScrollAtivo = false;
		navegarProximaPaginaDRM();
	}
}

function rolarInicioDocumentoDRM() {
	var app = document.getElementById('drmViewerApp');
	if (!app || documentoDRMState.alvosScroll.length == 0) {
		return;
	}

	for (var i = 0; i < documentoDRMState.alvosScroll.length; i++) {
		var alvo = documentoDRMState.alvosScroll[i];
		var metricas = obterMetricasScrollDRM(alvo);
		if (!metricas) {
			continue;
		}

		if (alvo === window) {
			app.scrollIntoView({ block: 'start' });
			continue;
		}

		if (alvo && alvo.window === alvo) {
			alvo.scrollTo(0, 0);
			continue;
		}

		var alvoRect = alvo.getBoundingClientRect();
		var appRect = app.getBoundingClientRect();
		alvo.scrollTop = Math.max(0, alvo.scrollTop + appRect.top - alvoRect.top);
	}
}

function alterarZoomDRM(delta) {
	definirZoomDRM(documentoDRMState.zoom + delta);
}

function definirZoomDRM(proximoZoom) {
	if (isNaN(proximoZoom)) {
		return;
	}

	if (proximoZoom < 0.5) {
		proximoZoom = 0.5;
	}

	if (proximoZoom > 1.5) {
		proximoZoom = 1.5;
	}

	documentoDRMState.zoom = Math.round(proximoZoom * 100) / 100;
	atualizarZoomDRM();
	aplicarZoomDRM();
}

function atualizarZoomDRM() {
	var percentual = Math.round(documentoDRMState.zoom * 100);

	if ($('#drmZoomInfo').length > 0) {
		$('#drmZoomInfo').text(percentual + '%');
	}

	var $range = $('#drmZoomRange');
	if ($range.length > 0) {
		var minimo = parseInt($range.attr('min'), 10) || 50;
		var maximo = parseInt($range.attr('max'), 10) || 150;
		var preenchimento = ((percentual - minimo) * 100) / (maximo - minimo);

		preenchimento = Math.max(0, Math.min(100, preenchimento));
		$range.val(percentual);
		$range.get(0).style.setProperty('--zoom-fill', preenchimento + '%');
	}
}

function aplicarZoomDRM() {
	if (documentoDRMState.tipoDocumento == '1') {
		if ($('#viewerDrmImage').length > 0) {
			$('#viewerDrmImage').css({
				width: (documentoDRMState.zoom * 100) + '%',
				maxWidth: 'none'
			});
		}
		return;
	}

	var frame = document.getElementById('viewerDrmFrame');
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	if (!doc.body) {
		return;
	}

	doc.body.style.transform = 'scale(' + documentoDRMState.zoom + ')';
	doc.body.style.transformOrigin = 'top center';
	doc.body.style.width = (100 / documentoDRMState.zoom) + '%';
	doc.body.style.marginLeft = 'auto';
	doc.body.style.marginRight = 'auto';

	ajustarAlturaFrameDRM();
}

function ajustarAlturaFrameDRM() {
	var frame = document.getElementById('viewerDrmFrame');
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	if (!doc.body || !doc.documentElement) {
		return;
	}

	var alturaBase = Math.max(
		doc.body.scrollHeight || 0,
		doc.documentElement.scrollHeight || 0,
		doc.body.offsetHeight || 0,
		doc.documentElement.offsetHeight || 0
	);

	frame.style.height = Math.ceil((alturaBase * documentoDRMState.zoom) + 24) + 'px';
}

function alterarFonteDRM(delta) {
	if (documentoDRMState.tipoDocumento != '2') {
		return;
	}

	var proximaFonte = documentoDRMState.fontScale + delta;

	if (proximaFonte < 0.9) {
		proximaFonte = 0.9;
	}

	if (proximaFonte > 1.4) {
		proximaFonte = 1.4;
	}

	documentoDRMState.fontScale = Math.round(proximaFonte * 10) / 10;
	atualizarFonteDRM();
	aplicarFonteDRM();
}

function atualizarFonteDRM() {
	if ($('#drmFontInfo').length > 0) {
		$('#drmFontInfo').text(Math.round(documentoDRMState.fontScale * 100) + '%');
	}
}

function aplicarFonteDRM() {
	if (documentoDRMState.tipoDocumento != '2') {
		return;
	}

	var frame = document.getElementById('viewerDrmFrame');
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	if (!doc.documentElement || !doc.body) {
		return;
	}

	doc.documentElement.style.fontSize = Math.round(documentoDRMState.fontScale * 100) + '%';
	doc.body.style.fontSize = '100%';

	ajustarAlturaFrameDRM();
}

function normalizarEntrelinhaEpubDRM(valor) {
	if (valor === 'justo' || valor === 'grande') {
		return valor;
	}
	return 'normal';
}

function carregarPreferenciaEntrelinhaEpubDRM() {
	try {
		return normalizarEntrelinhaEpubDRM(window.localStorage.getItem('tutor.epub.entrelinha'));
	} catch (e) {
		return 'normal';
	}
}

function salvarPreferenciaEntrelinhaEpubDRM(valor) {
	try {
		window.localStorage.setItem('tutor.epub.entrelinha', valor);
	} catch (e) {
		/* O leitor continua funcionando quando o armazenamento estiver bloqueado. */
	}
}

function definirEntrelinhaEpubDRM(valor) {
	if (documentoDRMState.tipoDocumento != '2') {
		return;
	}

	documentoDRMState.entrelinha = normalizarEntrelinhaEpubDRM(valor);
	salvarPreferenciaEntrelinhaEpubDRM(documentoDRMState.entrelinha);
	atualizarEntrelinhaEpubDRM();
	aplicarEntrelinhaEpubDRM();
	fecharMenuEntrelinhaEpubDRM();
}

function atualizarEntrelinhaEpubDRM() {
	var valorAtual = normalizarEntrelinhaEpubDRM(documentoDRMState.entrelinha);
	var rotulos = {
		justo: 'Justo',
		normal: 'Normal',
		grande: 'Grande'
	};

	$('.viewer-line-height-button').each(function() {
		var ativo = $(this).attr('data-line-height') === valorAtual;
		$(this)
			.toggleClass('active', ativo)
			.attr('aria-checked', ativo ? 'true' : 'false');
	});

	$('#btnDrmLineHeightMenu')
		.attr('aria-label', 'Entrelinha: ' + rotulos[valorAtual])
		.attr('title', 'Entrelinha: ' + rotulos[valorAtual]);
}

function alternarMenuEntrelinhaEpubDRM() {
	if (documentoDRMState.tipoDocumento != '2') {
		return;
	}

	var $grupo = $('#drmLineHeightControls');
	var abrir = !$grupo.hasClass('is-open');

	if (abrir) {
		$grupo.addClass('is-open');
		$('#btnDrmLineHeightMenu').attr('aria-expanded', 'true');
		$grupo.find('.viewer-line-height-button.active').first().focus();
	} else {
		fecharMenuEntrelinhaEpubDRM();
	}
}

function fecharMenuEntrelinhaEpubDRM() {
	$('#drmLineHeightControls').removeClass('is-open');
	$('#btnDrmLineHeightMenu').attr('aria-expanded', 'false');
}

function aplicarEntrelinhaEpubDRM(frame) {
	if (documentoDRMState.tipoDocumento != '2') {
		return;
	}

	frame = frame || document.getElementById('viewerDrmFrame');
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	if (!doc.documentElement) {
		return;
	}

	var valores = {
		justo: { texto: '1.5', nota: '1.45' },
		normal: { texto: '1.82', nota: '1.7' },
		grande: { texto: '2.15', nota: '2' }
	};
	var valorAtual = normalizarEntrelinhaEpubDRM(documentoDRMState.entrelinha);
	var configuracao = valores[valorAtual];

	doc.documentElement.style.setProperty('--drm-line-height-texto', configuracao.texto);
	doc.documentElement.style.setProperty('--drm-line-height-nota', configuracao.nota);
	ajustarAlturaFrameDRM();
}

function bindSwipeDRM() {
	var element = document.getElementById('viewerDrmRoot');
	if (!element) {
		return;
	}

	element.removeEventListener('touchstart', handleTouchStartDRM);
	element.removeEventListener('touchmove', handleTouchMoveDRM);
	element.removeEventListener('touchend', handleTouchEndDRM);
	element.removeEventListener('touchcancel', resetTouchSwipeDRM);

	element.addEventListener('touchstart', handleTouchStartDRM, { passive: true });
	element.addEventListener('touchmove', handleTouchMoveDRM, { passive: true });
	element.addEventListener('touchend', handleTouchEndDRM, { passive: true });
	element.addEventListener('touchcancel', resetTouchSwipeDRM);
}

function handleTouchStartDRM(event) {
	if (!event.touches || event.touches.length !== 1) {
		resetTouchSwipeDRM();
		return;
	}

	var touch = event.touches[0];
	var target = event.target;

	if (isSwipeExcludedTargetDRM(target)) {
		resetTouchSwipeDRM();
		return;
	}

	documentoDRMState.touchSwipe.active = true;
	documentoDRMState.touchSwipe.startX = touch.clientX;
	documentoDRMState.touchSwipe.startY = touch.clientY;
	documentoDRMState.touchSwipe.deltaX = 0;
	documentoDRMState.touchSwipe.deltaY = 0;
	documentoDRMState.touchSwipe.lockedAxis = '';
}

function handleTouchMoveDRM(event) {
	if (!documentoDRMState.touchSwipe.active || !event.touches || event.touches.length !== 1) {
		return;
	}

	var touch = event.touches[0];

	documentoDRMState.touchSwipe.deltaX = touch.clientX - documentoDRMState.touchSwipe.startX;
	documentoDRMState.touchSwipe.deltaY = touch.clientY - documentoDRMState.touchSwipe.startY;

	if (!documentoDRMState.touchSwipe.lockedAxis) {
		var absX = Math.abs(documentoDRMState.touchSwipe.deltaX);
		var absY = Math.abs(documentoDRMState.touchSwipe.deltaY);

		if (absX >= 18 || absY >= 18) {
			documentoDRMState.touchSwipe.lockedAxis = absX > absY ? 'x' : 'y';
		}
	}
}

function handleTouchEndDRM() {
	if (!documentoDRMState.touchSwipe.active) {
		return;
	}

	var deltaX = documentoDRMState.touchSwipe.deltaX;
	var deltaY = documentoDRMState.touchSwipe.deltaY;
	var absX = Math.abs(deltaX);
	var absY = Math.abs(deltaY);

	var shouldNavigate =
		documentoDRMState.touchSwipe.lockedAxis === 'x' &&
		absX >= 72 &&
		absY <= 90 &&
		absX > absY * 1.2;

	resetTouchSwipeDRM();

	if (!shouldNavigate) {
		return;
	}

	if (deltaX < 0 && documentoDRMState.paginaAtual < documentoDRMState.paginaFinal) {
		navegarProximaPaginaDRM();
		return;
	}
	
	if (deltaX > 0 && documentoDRMState.paginaAtual > documentoDRMState.paginaInicial) {
		navegarPaginaAnteriorDRM();
	}

}

function resetTouchSwipeDRM() {
	documentoDRMState.touchSwipe.active = false;
	documentoDRMState.touchSwipe.startX = 0;
	documentoDRMState.touchSwipe.startY = 0;
	documentoDRMState.touchSwipe.deltaX = 0;
	documentoDRMState.touchSwipe.deltaY = 0;
	documentoDRMState.touchSwipe.lockedAxis = '';
}

function isSwipeExcludedTargetDRM(target) {
	if (!target || typeof target.closest !== 'function') {
		return false;
	}

	return !!target.closest('a, button, input, textarea, select, label');
}

function resetDocumentoDRM() {
	desvincularScrollDocumentoDRM();
	desvincularLayoutColunasEpubDRM();
	desvincularTemaEpubDRM();
	$(window).off('resize.documentoDRMFootnote scroll.documentoDRMFootnote');
	$('#modalBodyMedia').off('scroll.documentoDRMFootnote');
	$(document).off('.documentoDRMFootnote');
	$('#drmFootnotePopover, #btnDrmFecharNotaRodape').off('.documentoDRMFootnote');
	fecharNotaRodapeDRM();
	documentoDRMState.requestToken++;
	documentoDRMState.idDocumento = null;
	documentoDRMState.tipoDocumento = null;
	documentoDRMState.totalPaginas = 0;
	documentoDRMState.chave = null;
	documentoDRMState.paginaAtual = 1;
	documentoDRMState.zoom = 1;
	documentoDRMState.fontScale = 1;
	documentoDRMState.entrelinha = 'normal';
	documentoDRMState.paginaInicial = 1;
	documentoDRMState.paginaFinal = 0;
	documentoDRMState.indicePaginas = [];
	documentoDRMState.indiceTopicos = [];
	documentoDRMState.paginaAtualMeta = null;
	documentoDRMState.ancoraPendente = null;
	documentoDRMState.ancorasResolvidas = {};
	documentoDRMState.notasRodapeCache = {};
	documentoDRMState.notaRodapeChaveAtual = null;
	documentoDRMState.notaRodapeFixada = false;
	documentoDRMState.notaRodapeTrigger = null;
	if (documentoDRMState.notaRodapeTimer) {
		clearTimeout(documentoDRMState.notaRodapeTimer);
		documentoDRMState.notaRodapeTimer = null;
	}
	documentoDRMState.carregandoPagina = false;
	documentoDRMState.avancoScrollAtivo = false;
	documentoDRMState.anotacoes = [];
	documentoDRMState.anotacoesCarregadas = false;
	documentoDRMState.anotacoesCarregando = false;
	documentoDRMState.anotacaoFiltro = 'page';
	documentoDRMState.anotacaoEditando = null;
	documentoDRMState.anotacaoCor = 'amarelo';
	documentoDRMState.selecaoEpub = null;
	documentoDRMState.selecaoEpubCor = 'amarelo';
	documentoDRMState.anotacaoFocoPendente = null;

	limparIndiceDRM();

	if (documentoDRMState.objectUrl) {
		URL.revokeObjectURL(documentoDRMState.objectUrl);
		documentoDRMState.objectUrl = null;
	}

	var frame = document.getElementById('viewerDrmFrame');
	if (frame) {
		frame.onload = null;
		frame.srcdoc = '';
	}

	if ($('#drmViewerToolbar').length > 0) {
		$('#drmViewerToolbar').removeClass('is-menu-open');
	}

	fecharPainelAnotacoesDRM(false);
	fecharMenuSelecaoTextoEpubDRM(true);
	$('#drmAnnotationCount').hide().text('0');

	resetTouchSwipeDRM();
}

function carregarIndiceDRM() {
	var requestToken = documentoDRMState.requestToken;

	if (documentoDRMState.tipoDocumento != '2' || !$('#drmIndiceSelect').length) {
		limparIndiceDRM();
		return;
	}

	var idDocumento = documentoDRMState.idDocumento;
	var indicePaginasRequest = buscarArquivoIndiceDRM(idDocumento, '');
	var indiceTopicosRequest = buscarArquivoIndiceDRM(idDocumento, 'topicos').catch(function() {
		return [];
	});

	Promise.all([indicePaginasRequest, indiceTopicosRequest]).then(function(indices) {
		if (requestToken !== documentoDRMState.requestToken) {
			return;
		}
		popularIndiceDRM(indices[0], indices[1]);
	}).catch(function() {
		if (requestToken !== documentoDRMState.requestToken) {
			return;
		}
		limparIndiceDRM();
	});
}

function buscarArquivoIndiceDRM(idDocumento, tipoIndice) {
	var url = '/portal/leitor/indice?idDocumento=' + encodeURIComponent(idDocumento);
	if (tipoIndice) {
		url += '&tipo=' + encodeURIComponent(tipoIndice);
	}

	return fetch(url, {
		method: 'GET',
		cache: 'no-store',
		credentials: 'same-origin'
	}).then(function(response) {
		if (!response.ok) {
			throw new Error('Erro ao buscar indice DRM (' + response.status + ')');
		}
		return response.json();
	});
}

function popularIndiceDRM(items, topicos) {
	var $wrapper = $('#drmIndiceWrapper');
	var $select = $('#drmIndiceSelect');

	if ($select.length == 0) {
		return;
	}

	var paginaInicial = documentoDRMState.paginaInicial || 1;
	var paginaFinal = documentoDRMState.paginaFinal || documentoDRMState.totalPaginas || paginaInicial;

	var filtrados = $.grep(items || [], function(item) {
		var pagina = parseInt(item.page, 10);
		return !isNaN(pagina) && pagina >= paginaInicial && pagina <= paginaFinal && item.label;
	});

	var topicosFiltrados = $.grep(topicos || [], function(item) {
		var pagina = parseInt(item.page, 10);
		return !isNaN(pagina) && pagina >= paginaInicial && pagina <= paginaFinal && item.label;
	});

	documentoDRMState.indicePaginas = filtrados;
	documentoDRMState.indiceTopicos = topicosFiltrados.length > 0
		? prepararTopicosIndiceDRM(topicosFiltrados)
		: agruparTopicosIndiceDRM(filtrados);

	if ($select.data('selectpicker')) {
		$select.selectpicker('destroy');
	}

	$select.empty();
	$select.append($('<option value=""></option>'));

	for (var i = 0; i < documentoDRMState.indiceTopicos.length; i++) {
		var item = documentoDRMState.indiceTopicos[i];
		item.optionValue = String(item.page) + ':' + i;
		$select.append(
			$('<option></option>')
				.val(item.optionValue)
				.attr('data-tokens', normalizarTextoBuscaTopicoDRM(item.label))
				.text(item.label)
		);
	}

	if (documentoDRMState.indiceTopicos.length == 0) {
		$wrapper.hide();
		return;
	}

	$wrapper.show();
	$select.selectpicker();
	refreshIndiceSelectDRM();
	atualizarIndiceSelecionadoDRM(documentoDRMState.paginaAtual);

}

function prepararTopicosIndiceDRM(items) {
	var topicos = [];

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var pagina = parseInt(item.page, 10);
		var titulo = normalizarTituloTopicoDRM(item.label);

		if (!titulo || isNaN(pagina)) {
			continue;
		}

		var topico = $.extend({}, item);
		topico.label = titulo;
		topico.page = pagina;
		topico.pages = [pagina];
		topicos.push(topico);
	}

	return topicos;
}

function agruparTopicosIndiceDRM(items) {
	var topicos = [];
	var topicosPorTitulo = {};

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var pagina = parseInt(item.page, 10);
		var titulo = normalizarTituloTopicoDRM(item.label);

		if (!titulo || isNaN(pagina)) {
			continue;
		}

		var chave = 'topico:' + titulo.toLowerCase();
		var topico = topicosPorTitulo[chave];

		if (!topico) {
			topico = $.extend({}, item);
			topico.label = titulo;
			topico.page = pagina;
			topico.pages = [pagina];
			topicosPorTitulo[chave] = topico;
			topicos.push(topico);
			continue;
		}

		topico.pages.push(pagina);
		if (pagina < parseInt(topico.page, 10)) {
			topico.page = pagina;
		}
	}

	return topicos;
}

function normalizarTituloTopicoDRM(label) {
	return String(label || '')
		.replace(/\s*-\s*p\.\s*\d+\s*$/i, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function normalizarTextoBuscaTopicoDRM(label) {
	var texto = normalizarTituloTopicoDRM(label).toLowerCase();
	if (typeof texto.normalize === 'function') {
		texto = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}
	return texto;
}

function atualizarIndiceSelecionadoDRM(numeroPagina) {
	var $select = $('#drmIndiceSelect');

	if ($select.length == 0 || documentoDRMState.indiceTopicos.length == 0) {
		return;
	}

	var valorSelecionado = buscarValorTopicoIndiceDRM(numeroPagina);

	$select.val(valorSelecionado);

	if ($select.data('selectpicker')) {
		$select.selectpicker('refresh');
		$select.selectpicker('val', valorSelecionado);
	}
}

function buscarValorTopicoIndiceDRM(numeroPagina) {
	var paginaAtual = parseInt(numeroPagina, 10);
	var paginaTopico = null;
	var valorTopico = '';

	for (var i = 0; i < documentoDRMState.indiceTopicos.length; i++) {
		var topico = documentoDRMState.indiceTopicos[i];
		var paginaInicialTopico = parseInt(topico.page, 10);

		if (!isNaN(paginaInicialTopico) && paginaInicialTopico <= paginaAtual
				&& (paginaTopico == null || paginaInicialTopico >= paginaTopico)) {
			paginaTopico = paginaInicialTopico;
			valorTopico = topico.optionValue || String(paginaInicialTopico);
		}
	}

	return valorTopico;
}

function limparIndiceDRM() {
	var $wrapper = $('#drmIndiceWrapper');
	var $select = $('#drmIndiceSelect');

	documentoDRMState.indicePaginas = [];
	documentoDRMState.indiceTopicos = [];

	if ($select.length > 0) {
		if ($select.data('selectpicker')) {
			$select.selectpicker('destroy');
		}
		$select.empty();
	}

	if ($wrapper.length > 0) {
		$wrapper.hide();
	}
}

function refreshIndiceSelectDRM() {
	var $select = $('#drmIndiceSelect');

	if ($select.length == 0 || !$select.data('selectpicker')) {
		return;
	}

	$select.selectpicker('render');
	$select.selectpicker('refresh');
}

function buscarIndiceItemPaginaDRM(numeroPagina) {
	for (var i = 0; i < documentoDRMState.indicePaginas.length; i++) {
		if (parseInt(documentoDRMState.indicePaginas[i].page, 10) === parseInt(numeroPagina, 10)) {
			return documentoDRMState.indicePaginas[i];
		}
	}
	return null;
}

function normalizarNomeArquivoDRM(valor) {
	if (!valor) {
		return '';
	}
	var texto = String(valor).replace(/\\/g, '/');
	var partes = texto.split('/');
	return partes[partes.length - 1];
}

function bindLinksInternosFrameDRM(frame) {
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	if (doc._drmLinksBound) {
		return;
	}
	doc._drmLinksBound = true;
	vincularControlesNotaRodapeDRM();

	var linksNotas = doc.querySelectorAll('a[role="doc-noteref"], a[data-type="noteref"], a._idFootnoteLink');
	for (var i = 0; i < linksNotas.length; i++) {
		linksNotas[i].setAttribute('aria-haspopup', 'dialog');
		linksNotas[i].setAttribute('title', 'Exibir nota ' + $.trim(linksNotas[i].textContent || ''));
	}

	doc.addEventListener('mouseover', function(event) {
		var link = obterLinkNotaRodapeDRM(event.target);
		if (!link || (event.relatedTarget && link.contains(event.relatedTarget))) {
			return;
		}
		abrirNotaRodapeDRM(link, frame, false);
	}, true);

	doc.addEventListener('mouseout', function(event) {
		var link = obterLinkNotaRodapeDRM(event.target);
		if (!link || (event.relatedTarget && link.contains(event.relatedTarget))) {
			return;
		}
		agendarFechamentoNotaRodapeDRM();
	}, true);

	doc.addEventListener('focusin', function(event) {
		var link = obterLinkNotaRodapeDRM(event.target);
		if (link) {
			abrirNotaRodapeDRM(link, frame, false);
		}
	}, true);

	doc.addEventListener('focusout', function(event) {
		if (obterLinkNotaRodapeDRM(event.target)) {
			agendarFechamentoNotaRodapeDRM();
		}
	}, true);
	doc.addEventListener('scroll', function() {
		fecharNotaRodapeDRM();
	}, true);

	doc.addEventListener('click', function(event) {
		var alvo = event.target;
		if (!alvo || typeof alvo.closest !== 'function') {
			return;
		}

		var link = alvo.closest('a[href]');
		if (!link) {
			fecharNotaRodapeDRM();
			return;
		}

		var href = link.getAttribute('href');
		if (isLinkNotaRodapeDRM(link)) {
			event.preventDefault();
			event.stopImmediatePropagation();
			abrirNotaRodapeDRM(link, frame, true);
			return;
		}

		fecharNotaRodapeDRM();
		if (!isLinkInternoDocumentoDRM(href)) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		navegarLinkInternoDRM(href, frame);
	}, true);
}

function vincularControlesNotaRodapeDRM() {
	$('#btnDrmFecharNotaRodape')
		.off('click.documentoDRMFootnote')
		.on('click.documentoDRMFootnote', function() {
			fecharNotaRodapeDRM(true);
		});

	$('#drmFootnotePopover')
		.off('mouseenter.documentoDRMFootnote mouseleave.documentoDRMFootnote')
		.on('mouseenter.documentoDRMFootnote', cancelarFechamentoNotaRodapeDRM)
		.on('mouseleave.documentoDRMFootnote', agendarFechamentoNotaRodapeDRM);

	$(document)
		.off('mousedown.documentoDRMFootnote keydown.documentoDRMFootnote')
		.on('mousedown.documentoDRMFootnote', function(event) {
			if ($('#drmFootnotePopover').hasClass('is-open') && $(event.target).closest('#drmFootnotePopover').length === 0) {
				fecharNotaRodapeDRM();
			}
		})
		.on('keydown.documentoDRMFootnote', function(event) {
			if (event.key === 'Escape' && $('#drmFootnotePopover').hasClass('is-open')) {
				event.preventDefault();
				fecharNotaRodapeDRM(true);
			}
		});

	$(window)
		.off('resize.documentoDRMFootnote scroll.documentoDRMFootnote')
		.on('resize.documentoDRMFootnote scroll.documentoDRMFootnote', function() {
			fecharNotaRodapeDRM();
		});

	$('#modalBodyMedia')
		.off('scroll.documentoDRMFootnote')
		.on('scroll.documentoDRMFootnote', function() {
			fecharNotaRodapeDRM();
		});
}

function obterLinkNotaRodapeDRM(alvo) {
	if (!alvo || typeof alvo.closest !== 'function') {
		return null;
	}
	var link = alvo.closest('a[href]');
	return link && isLinkNotaRodapeDRM(link) ? link : null;
}

function isLinkNotaRodapeDRM(link) {
	if (!link) {
		return false;
	}
	var role = String(link.getAttribute('role') || '').toLowerCase();
	var dataType = String(link.getAttribute('data-type') || '').toLowerCase();
	var href = String(link.getAttribute('href') || '');
	var destino = extrairDestinoLinkDRM(href);
	var idLink = String(link.getAttribute('id') || '');

	return role === 'doc-noteref'
		|| dataType === 'noteref'
		|| link.classList.contains('_idFootnoteLink')
		|| (!!destino && /^footnote-/i.test(destino.ancora || '') && /-backlink$/i.test(idLink));
}

function abrirNotaRodapeDRM(link, frame, fixar) {
	if (documentoDRMState.tipoDocumento != '2' || !link || !frame) {
		return;
	}
	if (documentoDRMState.notaRodapeFixada && !fixar) {
		return;
	}

	var destino = extrairDestinoLinkDRM(link.getAttribute('href'));
	if (!destino || !destino.ancora) {
		return;
	}

	cancelarFechamentoNotaRodapeDRM();
	var chave = (destino.arquivo || '') + '#' + destino.ancora;
	var requestToken = documentoDRMState.requestToken;
	documentoDRMState.notaRodapeChaveAtual = chave;
	documentoDRMState.notaRodapeFixada = !!fixar;
	documentoDRMState.notaRodapeTrigger = link;

	var numeroNota = $.trim(link.textContent || '');
	$('#drmFootnoteTitle').text(numeroNota ? 'Nota ' + numeroNota : 'Nota');
	$('#drmFootnoteContent').addClass('is-loading').text('Carregando nota...');
	$('#drmFootnotePopover')
		.toggleClass('is-pinned', !!fixar)
		.addClass('is-open')
		.attr('aria-hidden', 'false');
	posicionarNotaRodapeDRM(link, frame);

	obterTextoNotaRodapeDRM(destino, frame).then(function(texto) {
		if (requestToken !== documentoDRMState.requestToken || documentoDRMState.notaRodapeChaveAtual !== chave) {
			return;
		}
		$('#drmFootnoteContent').removeClass('is-loading').text(texto || 'Conteúdo da nota não encontrado.');
		posicionarNotaRodapeDRM(link, frame);
	}).catch(function() {
		if (requestToken !== documentoDRMState.requestToken || documentoDRMState.notaRodapeChaveAtual !== chave) {
			return;
		}
		$('#drmFootnoteContent').removeClass('is-loading').text('Não foi possível carregar esta nota.');
		posicionarNotaRodapeDRM(link, frame);
	});
}

function obterTextoNotaRodapeDRM(destino, frame) {
	var chave = (destino.arquivo || '') + '#' + destino.ancora;
	var cache = documentoDRMState.notasRodapeCache;
	if (cache[chave]) {
		return cache[chave];
	}

	var docAtual = frame && frame.contentWindow ? frame.contentWindow.document : null;
	var textoAtual = extrairTextoNotaRodapeDRM(docAtual, destino.ancora);
	if (textoAtual) {
		cache[chave] = Promise.resolve(textoAtual);
		return cache[chave];
	}

	var promise = resolverPaginaLinkDRM(destino.arquivo, destino.ancora).then(function(pagina) {
		if (!pagina) {
			return '';
		}
		return buscarPaginaDRM(pagina).then(function(bytes) {
			var html = new TextDecoder('utf-8').decode(bytes);
			var doc = new DOMParser().parseFromString(html, 'text/html');
			return extrairTextoNotaRodapeDRM(doc, destino.ancora);
		});
	}).catch(function(error) {
		if (cache[chave] === promise) {
			delete cache[chave];
		}
		throw error;
	});

	cache[chave] = promise;
	return promise;
}

function extrairTextoNotaRodapeDRM(doc, ancora) {
	if (!doc || !ancora) {
		return '';
	}
	var id = decodeURIComponent(String(ancora)).trim();
	var elemento = doc.getElementById(id);
	if (!elemento) {
		return '';
	}

	var clone = elemento.cloneNode(true);
	var remover = clone.querySelectorAll('script, style, noscript, a[role="doc-backlink"], a._idFootnoteAnchor');
	for (var i = remover.length - 1; i >= 0; i--) {
		if (remover[i].parentNode) {
			remover[i].parentNode.removeChild(remover[i]);
		}
	}
	return String(clone.textContent || '').replace(/\s+/g, ' ').trim();
}

function posicionarNotaRodapeDRM(link, frame) {
	if (!link || !frame || !link.getBoundingClientRect) {
		return;
	}
	var linkRect = link.getBoundingClientRect();
	var frameRect = frame.getBoundingClientRect();
	var $popover = $('#drmFootnotePopover');
	var largura = $popover.outerWidth() || 380;
	var altura = $popover.outerHeight() || 100;
	var margem = 10;
	var centro = frameRect.left + linkRect.left + (linkRect.width / 2);
	var metade = largura / 2;
	var esquerda = Math.max(metade + margem, Math.min(window.innerWidth - metade - margem, centro));
	var topoLink = frameRect.top + linkRect.top;
	var baseLink = frameRect.top + linkRect.bottom;
	var espacoAbaixo = window.innerHeight - baseLink;
	var mostrarAcima = espacoAbaixo < altura + 18 && topoLink > espacoAbaixo;

	$popover
		.toggleClass('is-above', mostrarAcima)
		.css({ left: esquerda + 'px', top: (mostrarAcima ? topoLink : baseLink) + 'px' });
}

function agendarFechamentoNotaRodapeDRM() {
	if (documentoDRMState.notaRodapeFixada) {
		return;
	}
	cancelarFechamentoNotaRodapeDRM();
	documentoDRMState.notaRodapeTimer = setTimeout(function() {
		documentoDRMState.notaRodapeTimer = null;
		fecharNotaRodapeDRM();
	}, 220);
}

function cancelarFechamentoNotaRodapeDRM() {
	if (documentoDRMState.notaRodapeTimer) {
		clearTimeout(documentoDRMState.notaRodapeTimer);
		documentoDRMState.notaRodapeTimer = null;
	}
}

function fecharNotaRodapeDRM(devolverFoco) {
	cancelarFechamentoNotaRodapeDRM();
	var trigger = documentoDRMState.notaRodapeTrigger;
	documentoDRMState.notaRodapeChaveAtual = null;
	documentoDRMState.notaRodapeFixada = false;
	documentoDRMState.notaRodapeTrigger = null;
	$('#drmFootnotePopover')
		.removeClass('is-open is-above is-pinned')
		.attr('aria-hidden', 'true');
	$('#drmFootnoteContent').removeClass('is-loading').text('');
	if (devolverFoco && trigger && typeof trigger.focus === 'function') {
		trigger.focus();
	}
}


function navegarLinkInternoDRM(href, frame) {
	var valor = String(href || '').trim();
	if (!valor) {
		return false;
	}

	if (valor.charAt(0) === '#') {
		scrollAncoraAtualDRM(valor.substring(1), frame);
		return true;
	}

	var partes = valor.split('#');
	var arquivo = normalizarNomeArquivoDRM(partes[0]);
	var ancora = partes.length > 1 ? partes[1] : '';

	var paginaMeta = documentoDRMState.paginaAtualMeta || buscarIndiceItemPaginaDRM(documentoDRMState.paginaAtual);
	var arquivoAtual = paginaMeta && paginaMeta.source ? normalizarNomeArquivoDRM(paginaMeta.source) : '';

	if (arquivo && arquivoAtual && arquivo === arquivoAtual && ancora) {
		scrollAncoraAtualDRM(ancora, frame);
		return true;
	}

	return false;
}

function scrollAncoraAtualDRM(ancora, frame) {
	documentoDRMState.ancoraPendente = ancora || null;
	aplicarAncoraPendenteDRM(frame);
}

function aplicarAncoraPendenteDRM(frame) {
	var ancora = documentoDRMState.ancoraPendente;
	if (!ancora) {
		return;
	}

	if (!frame) {
		frame = document.getElementById('viewerDrmFrame');
	}

	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	var idAncora = decodeURIComponent(String(ancora)).trim();
	if (!idAncora) {
		return;
	}

	var elemento = doc.getElementById(idAncora);
	if (!elemento) {
		return;
	}

	var frameRect = frame.getBoundingClientRect();
	var elementoRect = elemento.getBoundingClientRect();

	var topoDentroDoFrame = elementoRect.top;
	var topoNoDocumento = frameRect.top + window.pageYOffset + topoDentroDoFrame - 24;

	var $container = $('#modalBodyMedia');
	if ($container.length > 0) {
		var container = $container.get(0);
		var containerRect = container.getBoundingClientRect();
		var topAtual = container.scrollTop;
		var destino = topAtual + (frameRect.top - containerRect.top) + topoDentroDoFrame - 24;
	
		container.scrollTo({
			top: Math.max(0, destino),
			behavior: 'smooth'
		});
	} else {
		window.scrollTo({
			top: Math.max(0, topoNoDocumento),
			behavior: 'smooth'
		});
	}
	documentoDRMState.ancoraPendente = null;
}

function isLinkInternoDocumentoDRM(href) {
	var destino = extrairDestinoLinkDRM(href);
	if (!destino) {
		return false;
	}

	if (destino.ancora) {
		return true;
	}

	return /\.(xhtml|html)$/i.test(destino.arquivo || '');
}

function extrairDestinoLinkDRM(href) {
	var valor = String(href || '').trim();
	if (!valor) {
		return null;
	}

	if (/^(mailto:|tel:|javascript:)/i.test(valor)) {
		return null;
	}

	if (valor.charAt(0) === '#') {
		return {
			arquivo: '',
			ancora: valor.substring(1)
		};
	}

	var semQuery = valor.split('?')[0];
	var partes = semQuery.split('#');

	return {
		arquivo: normalizarNomeArquivoDRM(partes[0] || ''),
		ancora: partes.length > 1 ? partes.slice(1).join('#') : ''
	};
}

function ancoraExisteNoFrameDRM(ancora, frame) {
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return false;
	}

	var idAncora = decodeURIComponent(String(ancora || '')).trim();
	if (!idAncora) {
		return false;
	}

	return !!frame.contentWindow.document.getElementById(idAncora);
}

function navegarLinkInternoDRM(href, frame) {
	var destino = extrairDestinoLinkDRM(href);
	if (!destino) {
		return;
	}

	if (!destino.arquivo) {
		scrollAncoraAtualDRM(destino.ancora, frame);
		return;
	}

	if (destino.ancora && ancoraExisteNoFrameDRM(destino.ancora, frame)) {
		scrollAncoraAtualDRM(destino.ancora, frame);
		return;
	}

	resolverPaginaLinkDRM(destino.arquivo, destino.ancora).then(function(paginaDestino) {
		if (!paginaDestino) {
			return;
		}

		if (paginaDestino === documentoDRMState.paginaAtual && destino.ancora) {
			scrollAncoraAtualDRM(destino.ancora, frame);
			return;
		}

		carregarPaginaDRM(paginaDestino, destino.ancora || null);
	});
}

function resolverPaginaLinkDRM(arquivo, ancora) {
	var nomeArquivo = normalizarNomeArquivoDRM(arquivo);
	var idAncora = decodeURIComponent(String(ancora || '')).trim();
	var chave = nomeArquivo + '#' + idAncora;

	if (idAncora && documentoDRMState.ancorasResolvidas[chave]) {
		return Promise.resolve(documentoDRMState.ancorasResolvidas[chave]);
	}

	var candidatos = documentoDRMState.indicePaginas.filter(function(item) {
		return normalizarNomeArquivoDRM(item.source) === nomeArquivo || normalizarNomeArquivoDRM(item.file) === nomeArquivo;
	}).sort(function(a, b) {
		return parseInt(a.page, 10) - parseInt(b.page, 10);
	});

	if (candidatos.length === 0) {
		return Promise.resolve(null);
	}

	if (!idAncora) {
		return Promise.resolve(parseInt(candidatos[0].page, 10));
	}

	var buscarDoFim = /^footnote-/i.test(idAncora) && idAncora.indexOf('-backlink') === -1;
	if (buscarDoFim) {
		candidatos.reverse();
	}

	return buscarPaginaComAncoraDRM(candidatos, idAncora).then(function(pagina) {
		if (pagina && idAncora) {
			documentoDRMState.ancorasResolvidas[chave] = pagina;
		}
		return pagina;
	});
}

function buscarPaginaComAncoraDRM(candidatos, ancora) {
	var indice = 0;

	function proximo() {
		if (indice >= candidatos.length) {
			return Promise.resolve(null);
		}

		var pagina = parseInt(candidatos[indice].page, 10);
		indice++;

		return paginaContemAncoraDRM(pagina, ancora).then(function(existe) {
			if (existe) {
				return pagina;
			}
			return proximo();
		});
	}

	return proximo();
}

function paginaContemAncoraDRM(numeroPagina, ancora) {
	return buscarPaginaDRM(numeroPagina).then(function(bytes) {
		var html = new TextDecoder('utf-8').decode(bytes);
		var idAncora = decodeURIComponent(String(ancora || '')).trim();

		if (!idAncora) {
			return false;
		}

		var padrao = new RegExp("id\\s*=\\s*[\"']" + escapeRegExpDRM(idAncora) + "[\"']");
		return padrao.test(html);
	}).catch(function() {
		return false;
	});
}

function escapeRegExpDRM(valor) {
	return String(valor).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function vincularLayoutColunasEpubDRM() {
	desvincularLayoutColunasEpubDRM();

	if (documentoDRMState.tipoDocumento != '2') {
		return;
	}

	var pageWrapper = document.querySelector('.course-class4 .page-wrapper.primary');
	if (!pageWrapper) {
		return;
	}

	documentoDRMState.layoutObserver = new MutationObserver(function() {
		var atraso = pageWrapper.classList.contains('page-wide') ? 350 : 0;
		agendarLayoutColunasEpubDRM(atraso);
	});
	documentoDRMState.layoutObserver.observe(pageWrapper, {
		attributes: true,
		attributeFilter: ['class']
	});

	$(window)
		.off('resize.documentoDRMColunas')
		.on('resize.documentoDRMColunas', function() {
			agendarLayoutColunasEpubDRM(150);
		});
}

function desvincularLayoutColunasEpubDRM() {
	if (documentoDRMState.layoutObserver) {
		documentoDRMState.layoutObserver.disconnect();
		documentoDRMState.layoutObserver = null;
	}

	if (documentoDRMState.layoutTimer) {
		clearTimeout(documentoDRMState.layoutTimer);
		documentoDRMState.layoutTimer = null;
	}

	$(window).off('resize.documentoDRMColunas');
}

function agendarLayoutColunasEpubDRM(atraso) {
	if (documentoDRMState.layoutTimer) {
		clearTimeout(documentoDRMState.layoutTimer);
	}

	documentoDRMState.layoutTimer = setTimeout(function() {
		documentoDRMState.layoutTimer = null;
		aplicarLayoutColunasEpubDRM();
	}, atraso || 0);
}

function deveUsarDuasColunasEpubDRM() {
	if (documentoDRMState.tipoDocumento != '2') {
		return false;
	}

	var pageWrapper = document.querySelector('.course-class4 .page-wrapper.primary');
	if (!pageWrapper || !pageWrapper.classList.contains('page-wide')) {
		return false;
	}

	var outer = pageWrapper.querySelector('.outer');
	return !!outer && outer.getBoundingClientRect().width >= 900;
}

function aplicarLayoutColunasEpubDRM(frame) {
	if (documentoDRMState.tipoDocumento != '2') {
		return;
	}

	frame = frame || document.getElementById('viewerDrmFrame');
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	if (!doc.documentElement) {
		return;
	}

	var classe = 'drm-epub-duas-colunas';
	var usarDuasColunas = deveUsarDuasColunasEpubDRM();
	var estavaEmDuasColunas = doc.documentElement.classList.contains(classe);

	if (usarDuasColunas) {
		doc.documentElement.classList.add(classe);
	} else {
		doc.documentElement.classList.remove(classe);
	}

	if (usarDuasColunas !== estavaEmDuasColunas) {
		setTimeout(function() {
			ajustarAlturaFrameDRM();
		}, 0);
	}
}

function vincularTemaEpubDRM() {
	desvincularTemaEpubDRM();

	if (documentoDRMState.tipoDocumento != '2' || !document.body) {
		return;
	}

	documentoDRMState.themeObserver = new MutationObserver(function() {
		sincronizarTemaLeituraEpubDRM();
	});
	documentoDRMState.themeObserver.observe(document.body, {
		attributes: true,
		attributeFilter: ['class']
	});
}

function desvincularTemaEpubDRM() {
	if (documentoDRMState.themeObserver) {
		documentoDRMState.themeObserver.disconnect();
		documentoDRMState.themeObserver = null;
	}
}

function sincronizarTemaLeituraEpubDRM(frame) {
	if (documentoDRMState.tipoDocumento != '2') {
		return;
	}

	frame = frame || document.getElementById('viewerDrmFrame');
	if (!frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	if (!doc.documentElement) {
		return;
	}

	var temaEscuro = document.body && document.body.classList.contains('theme-dark');
	if (temaEscuro) {
		doc.documentElement.classList.add('drm-theme-dark');
	} else {
		doc.documentElement.classList.remove('drm-theme-dark');
	}
}

function aplicarTemaLeituraEpubDRM(frame) {
	if (documentoDRMState.tipoDocumento != '2' || !frame || !frame.contentWindow || !frame.contentWindow.document) {
		return;
	}

	var doc = frame.contentWindow.document;
	var style = doc.getElementById('drmEpubTheme');

	if (!style) {
		style = doc.createElement('style');
		style.id = 'drmEpubTheme';
		doc.head.appendChild(style);
	}

	style.textContent = `
		html {
			background: transparent !important;
		}

		body {
			margin: 0 !important;
			padding: 0 !important;
			background: transparent !important;
			color: #39424d !important;
		}

		body > div:first-child,
		body > section:first-child,
		body > article:first-child {
			max-width: 760px !important;
			margin: 0 auto !important;
			padding: 56px 64px 72px !important;
			background: #ffffff !important;
			border: 1px solid #efe7da !important;
			box-shadow: 0 22px 60px rgba(35, 44, 56, 0.08) !important;
			box-sizing: border-box !important;
		}

		html.drm-epub-duas-colunas body > div:first-child,
		html.drm-epub-duas-colunas body > section:first-child,
		html.drm-epub-duas-colunas body > article:first-child {
			max-width: 1280px !important;
			column-count: 2 !important;
			column-gap: 64px !important;
			column-fill: balance !important;
			column-rule: 1px solid #efe7da !important;
		}

		html.drm-epub-duas-colunas p.tit,
		html.drm-epub-duas-colunas p.CAPITULO-TITULO {
			column-span: all !important;
		}

		html.drm-epub-duas-colunas p.a,
		html.drm-epub-duas-colunas p.b,
		html.drm-epub-duas-colunas p.c,
		html.drm-epub-duas-colunas p.d,
		html.drm-epub-duas-colunas figure,
		html.drm-epub-duas-colunas table,
		html.drm-epub-duas-colunas blockquote,
		html.drm-epub-duas-colunas ._idFootnotes {
			-webkit-column-break-inside: avoid;
			break-inside: avoid-column;
		}

		.Quadro-de-texto-b-sico,
		._idGenObjectStyleOverride-1 {
			border: 0 !important;
		}

		p.texto,
		p.Normal,
		p.Texto---Iniciais,
		p.nota,
		li,
		blockquote {
			font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif !important;
			color: #3b4552 !important;
			font-size: 1.03rem !important;
			line-height: var(--drm-line-height-texto, 1.82) !important;
			letter-spacing: 0.002em !important;
		}

		p.tit,
		p.CAPITULO-TITULO {
			margin: 0 0 2.5rem !important;
			text-align: center !important;
			color: #27313d !important;
			font-family: "Avenir Next Condensed", "Arial Narrow", "Trebuchet MS", sans-serif !important;
			font-size: clamp(2.4rem, 4vw, 3.2rem) !important;
			line-height: 1.04 !important;
			font-weight: 800 !important;
			letter-spacing: -0.04em !important;
			text-transform: uppercase !important;
			page-break-before: auto !important;
		}

		p.a,
		p.b,
		p.c,
		p.d {
			font-family: "Avenir Next", "Trebuchet MS", sans-serif !important;
			color: #294050 !important;
			text-align: left !important;
			line-height: 1.35 !important;
			page-break-after: avoid !important;
		}

		p.a {
			font-size: 1.05rem !important;
			margin-top: 2.25rem !important;
			margin-bottom: 1rem !important;
		}

		p.b {
			font-size: 1rem !important;
			margin-top: 1.75rem !important;
			margin-bottom: 0.75rem !important;
		}

		p.c,
		p.d {
			font-size: 0.97rem !important;
			margin-top: 1.35rem !important;
			margin-bottom: 0.75rem !important;
		}

		._idFootnotes {
			margin-top: 2.75rem !important;
			padding-top: 1.5rem !important;
			border-top: 1px solid #e7dfd4 !important;
		}

		p.nota {
			font-size: 0.94rem !important;
			line-height: var(--drm-line-height-nota, 1.7) !important;
			text-indent: 0 !important;
		}

		hr,
		.HorizontalRule-1 {
			border: 0 !important;
			border-top: 1px solid #e7dfd4 !important;
			margin: 2.5rem 0 1.75rem !important;
		}

		a {
			color: #1f6074 !important;
			text-decoration: none !important;
		}

		p.texto a,
		p.texto a:hover,
		p.texto a:focus,
		p.texto a:active,
		p.texto a:visited {
			text-decoration: none !important;
		}

		a[role="doc-noteref"],
		a[data-type="noteref"],
		a._idFootnoteLink {
			cursor: help !important;
		}

		mark.tutor-drm-highlight {
			padding: 0.04em 0.02em !important;
			border-radius: 0.16em !important;
			background: rgba(241, 200, 75, 0.48) !important;
			color: inherit !important;
			cursor: pointer !important;
			-webkit-box-decoration-break: clone;
			box-decoration-break: clone;
			transition: box-shadow 160ms ease, background-color 160ms ease !important;
		}

		mark.tutor-drm-highlight.color-verde { background: rgba(101, 184, 121, 0.42) !important; }
		mark.tutor-drm-highlight.color-azul { background: rgba(97, 166, 216, 0.42) !important; }
		mark.tutor-drm-highlight.color-rosa { background: rgba(219, 130, 165, 0.42) !important; }
		mark.tutor-drm-highlight.is-note { box-shadow: inset 0 -2px 0 rgba(44, 98, 115, 0.72); }
		mark.tutor-drm-highlight.is-focus { box-shadow: 0 0 0 4px rgba(44, 98, 115, 0.28), inset 0 -2px 0 rgba(44, 98, 115, 0.72); }

		img,
		svg {
			max-width: 100% !important;
			height: auto !important;
		}

		html.drm-theme-dark {
			background: #17161a !important;
			color-scheme: dark;
		}

		html.drm-theme-dark body {
			background: #17161a !important;
			color: #e2e0e5 !important;
		}

		html.drm-theme-dark body > div:first-child,
		html.drm-theme-dark body > section:first-child,
		html.drm-theme-dark body > article:first-child {
			background: #201f24 !important;
			border-color: #39363f !important;
			box-shadow: 0 22px 60px rgba(0, 0, 0, 0.32) !important;
		}

		html.drm-theme-dark.drm-epub-duas-colunas body > div:first-child,
		html.drm-theme-dark.drm-epub-duas-colunas body > section:first-child,
		html.drm-theme-dark.drm-epub-duas-colunas body > article:first-child {
			column-rule-color: #45414c !important;
		}

		html.drm-theme-dark p,
		html.drm-theme-dark span,
		html.drm-theme-dark li,
		html.drm-theme-dark blockquote,
		html.drm-theme-dark td,
		html.drm-theme-dark th {
			color: #dedce2 !important;
			border-color: #45414c !important;
			background-color: transparent !important;
		}

		html.drm-theme-dark p.tit,
		html.drm-theme-dark p.tit span,
		html.drm-theme-dark p.CAPITULO-TITULO,
		html.drm-theme-dark p.CAPITULO-TITULO span {
			color: #ffffff !important;
		}

		html.drm-theme-dark p.a,
		html.drm-theme-dark p.a span,
		html.drm-theme-dark p.b,
		html.drm-theme-dark p.b span,
		html.drm-theme-dark p.c,
		html.drm-theme-dark p.c span,
		html.drm-theme-dark p.d,
		html.drm-theme-dark p.d span {
			color: #a9d1dc !important;
		}

		html.drm-theme-dark ._idFootnotes,
		html.drm-theme-dark hr,
		html.drm-theme-dark .HorizontalRule-1 {
			border-color: #45414c !important;
		}

		html.drm-theme-dark a,
		html.drm-theme-dark a:visited {
			color: #83c9dc !important;
		}

		html.drm-theme-dark table,
		html.drm-theme-dark tbody,
		html.drm-theme-dark thead,
		html.drm-theme-dark tr,
		html.drm-theme-dark td,
		html.drm-theme-dark th {
			background-color: transparent !important;
		}

		html.drm-theme-dark .tutor-drm-watermark span {
			color: rgba(214, 210, 220, 0.13) !important;
		}

		html.drm-theme-dark mark.tutor-drm-highlight {
			background: rgba(199, 158, 50, 0.48) !important;
			color: #f5f3f7 !important;
		}

		html.drm-theme-dark mark.tutor-drm-highlight.color-verde { background: rgba(66, 145, 87, 0.52) !important; }
		html.drm-theme-dark mark.tutor-drm-highlight.color-azul { background: rgba(57, 122, 171, 0.54) !important; }
		html.drm-theme-dark mark.tutor-drm-highlight.color-rosa { background: rgba(177, 77, 118, 0.52) !important; }
		html.drm-theme-dark mark.tutor-drm-highlight.is-note { box-shadow: inset 0 -2px 0 #9bd5e4; }
		html.drm-theme-dark mark.tutor-drm-highlight.is-focus { box-shadow: 0 0 0 4px rgba(155, 213, 228, 0.3), inset 0 -2px 0 #9bd5e4; }

		html.drm-theme-dark,
		html.drm-theme-dark body {
			scrollbar-color: #55505d #17161a;
		}

		html.drm-theme-dark ::selection {
			background: #3e7787 !important;
			color: #ffffff !important;
		}
	`;

	sincronizarTemaLeituraEpubDRM(frame);
}
