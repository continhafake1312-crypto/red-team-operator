(function() {
    
    function initChatWidget() {
        if (typeof jQuery === 'undefined') {
            console.error('Chat Widget requer jQuery');
            return;
        }
        
        var $ = jQuery;
        var CACHE_DURATION = 2 * 60 * 60 * 1000;
        var selectedSubject = null;
        var professoresData = [];
        var chatInserido = false;
        var ultimaPergunta = ''; // Armazena a última pergunta para enviar como dúvida
        
        window.ChatWidget = {
            config: {
                tokenProduto: null,
                contextPath: ''
            }
        };
        
        // ========================================
        // VERIFICAR SE BOTÃO DÚVIDA ESTÁ HABILITADO
        // ========================================
        
        function isBotaoDuvidaHabilitado() {
            try {
                var flagAI = $('#flagAI').val();
                if (!flagAI) return false;
                
                var arrayAI = flagAI.split('-');
                return arrayAI[14] == 1;
            } catch (e) {
                console.error('Erro ao verificar flagAI:', e);
                return false;
            }
        }
        
        // ========================================
        // INSERIR HTML DO CHAT
        // ========================================
        
        function inserirChatHTML() {
            if (chatInserido) {
                return;
            }
            
            if (document.getElementById('chatButton')) {
                chatInserido = true;
                return;
            }
            
            if (window.self !== window.top) {
                return;
            }
            
            var body = document.body;
            if (!body || body.parentNode.tagName.toUpperCase() !== 'HTML') {
                return;
            }
            
            var chatHTML = '' +
                '<div id="chatButton">' +
                    '<i class="fa-light fa-microchip-ai"></i>' +
                '</div>' +
                '<div id="chatContainer">' +
                    '<div class="chat-header">' +
                        '<h5 id="chatTitle">Chat de Dúvidas</h5>' +
                        '<button class="btn-close" id="closeChat">' +
                            '<i class="fas fa-times"></i>' +
                        '</button>' +
                    '</div>' +
                    '<div id="selectionArea">' +
                        '<div class="selection-title">' +
                            '<h6>Escolha o professor virtual (AI)</h6>' +
                            '<small class="text-muted">Selecione abaixo para iniciar</small>' +
                        '</div>' +
                    '</div>' +
                    '<div id="chatArea">' +
                        '<div class="chat-subheader">' +
                            '<div class="selected-info">' +
                                '<img id="selectedTeacherPhoto" src="" alt="" class="teacher-photo-small">' +
                                '<div class="info-text">' +
                                    '<div class="subject-name" id="selectedSubject"></div>' +
                                    '<small id="selectedTeacher"></small>' +
                                '</div>' +
                            '</div>' +
                            '<button class="btn-back" id="backButton" title="Voltar">' +
                                '<i class="fas fa-arrow-left"></i> Voltar' +
                            '</button>' +
                        '</div>' +
                        '<div id="messagesArea">' +
                            '<div class="typing-indicator" id="typingIndicator">' +
                                '<img id="typingTeacherPhoto" src="" alt="" class="teacher-photo-msg">' +
                                '<div class="typing-dots">' +
                                    '<span></span>' +
                                    '<span></span>' +
                                    '<span></span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="chat-input">' +
                            '<div class="input-group">' +
                                '<textarea id="messageInput" placeholder="Digite sua pergunta..." rows="1"></textarea>' +
                                '<button id="sendButton" disabled>' +
                                    '<i class="fas fa-paper-plane"></i>' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            
            // Modal Bootstrap 4 para enviar dúvida
            var modalHTML = '' +
                '<div class="modal fade" id="modalEnviarDuvida" tabindex="-1" role="dialog" aria-labelledby="modalEnviarDuvidaLabel" aria-hidden="true">' +
                    '<div class="modal-dialog modal-dialog-centered" role="document">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header bg-primary text-white">' +
                                '<h5 class="modal-title" id="modalEnviarDuvidaLabel">' +
                                    '<i class="fas fa-paper-plane mr-2"></i>Enviar Dúvida para Professores' +
                                '</h5>' +
                                '<button type="button" class="close text-white" data-dismiss="modal" aria-label="Fechar">' +
                                    '<span aria-hidden="true">&times;</span>' +
                                '</button>' +
                            '</div>' +
                            '<div class="modal-body">' +
                                '<div class="form-group">' +
                                    '<label for="inputAssuntoDuvida"><strong>Assunto da Dúvida</strong></label>' +
                                    '<input type="text" class="form-control" id="inputAssuntoDuvida" placeholder="Ex: Dúvida sobre o conteúdo" value="Dúvida sobre o conteúdo">' +
                                '</div>' +
                                '<div class="form-group">' +
                                    '<label><strong>Sua Pergunta</strong></label>' +
                                    '<div class="alert alert-light border" id="previewPerguntaDuvida" style="max-height: 150px; overflow-y: auto;"></div>' +
                                '</div>' +
                                '<small class="text-muted">' +
                                    '<i class="fas fa-info-circle mr-1"></i>' +
                                    'Sua dúvida será enviada para nossa equipe de professores e você receberá uma resposta em breve.' +
                                '</small>' +
                            '</div>' +
                            '<div class="modal-footer">' +
                                '<button type="button" class="btn btn-secondary" data-dismiss="modal">' +
                                    '<i class="fas fa-times mr-1"></i>Cancelar' +
                                '</button>' +
                                '<button type="button" class="btn btn-primary" id="btnConfirmarEnvioDuvida">' +
                                    '<i class="fas fa-paper-plane mr-1"></i>Enviar Dúvida' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            
            $('body').append(chatHTML);
            $('body').append(modalHTML);
            setupEventListeners();
            chatInserido = true;
        }
        
        // ========================================
        // FUNÇÕES DE CACHE
        // ========================================
        
        function getCacheKey(tokenProduto) {
            return 'chatWidget_professores_' + tokenProduto;
        }
        
        function salvarCache(tokenProduto, data) {
            var cacheData = {
                timestamp: new Date().getTime(),
                data: data
            };
            
            try {
                localStorage.setItem(getCacheKey(tokenProduto), JSON.stringify(cacheData));
            } catch (e) {
                console.error('Erro ao salvar cache:', e);
            }
        }
        
        function obterCache(tokenProduto) {
            try {
                var cacheString = localStorage.getItem(getCacheKey(tokenProduto));
                
                if (!cacheString) {
                    return null;
                }
                
                var cacheData = JSON.parse(cacheString);
                var now = new Date().getTime();
                var age = now - cacheData.timestamp;
                
                if (age > CACHE_DURATION) {
                    localStorage.removeItem(getCacheKey(tokenProduto));
                    return null;
                }
                
                return cacheData.data;
                
            } catch (e) {
                console.error('Erro ao obter cache:', e);
                return null;
            }
        }
        
        function limparCache(tokenProduto) {
            try {
                localStorage.removeItem(getCacheKey(tokenProduto));
            } catch (e) {
                console.error('Erro ao limpar cache:', e);
            }
        }
        
        // ========================================
        // FUNÇÕES DE CARREGAMENTO
        // ========================================
        
        function carregarProfessores() {
            if (!window.ChatWidget.config.tokenProduto) {
                return;
            }
            
            var tokenProduto = window.ChatWidget.config.tokenProduto;
            var cachedData = obterCache(tokenProduto);
            
            if (cachedData) {
                professoresData = cachedData;
                renderizarProfessores(cachedData);
                verificarEstadoSalvo();
                return;
            }
            
            var url = window.ChatWidget.config.contextPath + '/portal/professorai-lista';
            
            $.ajax({
                url: url,
                method: 'GET',
                data: {
                    tokenProduto: tokenProduto
                },
                success: function(data, textStatus, xhr) {
                    if (typeof data === 'string') {
                        if (data.trim() === '' || data === 'null') {
                            var container = $('#selectionArea');
                            container.find('.subject-card').remove();
                            container.append('<p class="text-center text-danger">Nenhum professor encontrado.</p>');
                            return;
                        }
                        
                        try {
                            data = JSON.parse(data);
                        } catch (e) {
                            console.error('Erro ao parsear JSON:', e);
                            var container = $('#selectionArea');
                            container.find('.subject-card').remove();
                            container.append('<p class="text-center text-danger">Erro ao processar resposta.</p>');
                            return;
                        }
                    }
                    
                    var professores = processarDadosProfessores(data);
                    
                    if (professores.length === 0) {
                        var container = $('#selectionArea');
                        container.find('.subject-card').remove();
                        container.append('<p class="text-center text-muted">Nenhum professor disponível.</p>');
                        return;
                    }
                    
                    salvarCache(tokenProduto, professores);
                    
                    professoresData = professores;
                    renderizarProfessores(professores);
                    verificarEstadoSalvo();
                },
                error: function(xhr, status, error) {
                    var container = $('#selectionArea');
                    container.find('.subject-card').remove();
                    
                    var mensagemErro = 'Erro ao carregar professores.';
                    
                    if (xhr.status === 404) {
                        mensagemErro = 'URL não encontrada.';
                    } else if (xhr.status === 500) {
                        mensagemErro = 'Erro no servidor.';
                    } else if (xhr.status === 0) {
                        mensagemErro = 'Não foi possível conectar.';
                    }
                    
                    container.append('<p class="text-center text-danger">' + mensagemErro + '</p>');
                }
            });
        }
        
        function processarDadosProfessores(data) {
            if (!data || !Array.isArray(data)) {
                return [];
            }
            
            var contextPath = window.ChatWidget.config.contextPath;
            var resultado = [];
            
            for (var i = 0; i < data.length; i++) {
                var funcionario = data[i];
                
                if (!funcionario.id) {
                    continue;
                }
                
                var nomeProfessor = funcionario.apelido || 'Professor';
                var disciplina = funcionario.materia || '';
                var foto = '';
                
                if (funcionario.token) {
                    foto = contextPath + '/fotoaluno/foto' + funcionario.token + '.jpg';
                } else {
                    foto = gerarAvatarUrl(nomeProfessor);
                }
                
                var professorObj = {
                    id: funcionario.id,
                    nome: nomeProfessor,
                    professor: nomeProfessor,
                    foto: foto,
                    disciplina: disciplina,
                    token: funcionario.token
                };
                
                resultado.push(professorObj);
            }
            
            return resultado;
        }
        
        function gerarAvatarUrl(nome) {
            if (!nome) {
                return 'https://ui-avatars.com/api/?name=Prof&background=007bff&color=fff&size=150';
            }
            
            var palavras = nome.split(' ');
            var iniciais = '';
            
            for (var i = 0; i < palavras.length && i < 2; i++) {
                if (palavras[i].length > 0) {
                    iniciais += palavras[i][0].toUpperCase();
                }
            }
            
            return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(iniciais) + '&background=007bff&color=fff&size=150';
        }
        
        function renderizarProfessores(professores) {
            var container = $('#selectionArea');
            container.find('.subject-card').remove();
            
            if (!professores || professores.length === 0) {
                container.append('<p class="text-center text-muted">Nenhum professor disponível.</p>');
                return;
            }
            
            for (var i = 0; i < professores.length; i++) {
                var prof = professores[i];
                var avatarFallback = gerarAvatarUrl(prof.professor);
                
                var cardHtml = '' +
                    '<div class="subject-card" ' +
                        'data-id="' + prof.id + '" ' +
                        'data-name="' + (prof.disciplina || prof.nome) + '" ' +
                        'data-teacher="' + prof.professor + '" ' +
                        'data-photo="' + prof.foto + '" ' +
                        'title="' + prof.disciplina + '">' +
                        '<img src="' + prof.foto + '" ' +
                             'alt="' + prof.professor + '" ' +
                             'class="teacher-photo" ' +
                             'onerror="this.src=\'' + avatarFallback + '\'">' +
                        '<div class="subject-info">' +
                            '<h6>' + (prof.disciplina || prof.nome) + '</h6>' +
                            '<small><i class="fas fa-user"></i> ' + prof.professor + '</small>' +
                        '</div>' +
                    '</div>';
                
                container.append(cardHtml);
            }
            
            $('.subject-card').off('click').on('click', function() {
                selecionarProfessor($(this));
            });
        }
        
        function verificarEstadoSalvo() {
            var estadoSalvo = localStorage.getItem('chatProfessorSelecionado');
            
            if (estadoSalvo) {
                try {
                    var professorSalvo = JSON.parse(estadoSalvo);
                    
                    if (professorSalvo.tokenProduto === window.ChatWidget.config.tokenProduto) {
                        setTimeout(function() {
                            var cardExiste = $('.subject-card[data-id="' + professorSalvo.id + '"]');
                            
                            if (cardExiste.length > 0) {
                                selecionarProfessor(cardExiste, true);
                            }
                        }, 100);
                    } else {
                        localStorage.removeItem('chatProfessorSelecionado');
                    }
                } catch (e) {
                    localStorage.removeItem('chatProfessorSelecionado');
                }
            }
        }
        
        // ========================================
        // EVENT LISTENERS
        // ========================================
        
        function setupEventListeners() {
            $(document).on('click', '#chatButton', function() {
                $('#chatContainer').toggleClass('active');
            });
            
            $(document).on('click', '#closeChat', function() {
                $('#chatContainer').removeClass('active');
            });
            
            $(document).on('click', '#backButton', function() {
                $('#chatArea').removeClass('active');
                $('#selectionArea').show();
                $('#messagesArea .message').remove();
                localStorage.removeItem('chatProfessorSelecionado');
                selectedSubject = null;
            });
            
            $(document).on('input', '#messageInput', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
                $('#sendButton').prop('disabled', $(this).val().trim() === '');
            });
            
            $(document).on('keypress', '#messageInput', function(e) {
                if (e.which === 13 && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            $(document).on('click', '#sendButton', function() {
                sendMessage();
            });
            
            // Event listener para botão de enviar dúvida (delegado)
            $(document).on('click', '.btn-enviar-duvida-professores', function() {
                abrirModalEnviarDuvida();
            });
            
            // Event listener para confirmar envio da dúvida no modal
            $(document).on('click', '#btnConfirmarEnvioDuvida', function() {
                confirmarEnvioDuvida();
            });
            
            // Limpar modal quando fechar
            $('#modalEnviarDuvida').on('hidden.bs.modal', function() {
                $('#inputAssuntoDuvida').val('Dúvida sobre o conteúdo');
                $('#btnConfirmarEnvioDuvida').prop('disabled', false).html('<i class="fas fa-paper-plane mr-1"></i>Enviar Dúvida');
            });
        }
        
        function selecionarProfessor($card, restaurandoEstado) {
            if (typeof restaurandoEstado === 'undefined') {
                restaurandoEstado = false;
            }
            
            var professorId = $card.data('id');
            
            if (!professorId || professorId === 'undefined' || professorId === '') {
                alert('Erro: ID do professor inválido.');
                return;
            }
            
            selectedSubject = {
                id: professorId,
                name: $card.data('name'),
                teacher: $card.data('teacher'),
                photo: $card.data('photo'),
                tokenProduto: window.ChatWidget.config.tokenProduto
            };
            
            localStorage.setItem('chatProfessorSelecionado', JSON.stringify(selectedSubject));
            
            var avatarFallback = gerarAvatarUrl(selectedSubject.teacher);
            
            $('#selectedSubject').text(selectedSubject.name);
            $('#selectedTeacher').text(selectedSubject.teacher);
            
            var imgHeader = $('#selectedTeacherPhoto');
            imgHeader.attr('src', selectedSubject.photo);
            imgHeader.attr('onerror', 'this.src=\'' + avatarFallback + '\'');
            
            var imgTyping = $('#typingTeacherPhoto');
            imgTyping.attr('src', selectedSubject.photo);
            imgTyping.attr('onerror', 'this.src=\'' + avatarFallback + '\'');
            
            $('#selectionArea').hide();
            $('#chatArea').addClass('active');
            
            if (!restaurandoEstado) {
                addBotMessage('Olá! Você está falando com ' + selectedSubject.teacher + '. Como posso ajudar?');
            }
        }
        
        function sendMessage() {
            var message = $('#messageInput').val().trim();
            
            if (message === '' || !selectedSubject) {
                return;
            }
            
            // Armazena a última pergunta
            ultimaPergunta = message;
            
            addUserMessage(message);
            
            var $input = $('#messageInput');
            $input.val('');
            $input.css('height', 'auto');
            $('#sendButton').prop('disabled', true);
            $input.focus();
            
            enviarMensagemServidor(message);
        }
        
        function addUserMessage(text) {
            var time = getCurrentTime();
            var html = '' +
                '<div class="message user">' +
                    '<div>' +
                        '<div class="message-content">' + escapeHtml(text) + '</div>' +
                        '<div class="message-time">' + time + '</div>' +
                    '</div>' +
                '</div>';
            
            var $typingIndicator = $('#typingIndicator');
            
            if ($typingIndicator.length > 0) {
                $typingIndicator.before(html);
            } else {
                $('#messagesArea').append(html);
            }
            
            scrollToBottom();
        }
        
        function addBotMessage(text) {
            var time = getCurrentTime();
            var avatarFallback = gerarAvatarUrl(selectedSubject.teacher);
            var fotoFinal = selectedSubject.photo;
            
            var html = '' +
                '<div class="message bot">' +
                    '<img src="' + fotoFinal + '" ' +
                         'alt="' + selectedSubject.teacher + '" ' +
                         'class="teacher-photo-msg" ' +
                         'onerror="this.src=\'' + avatarFallback + '\'">' +
                    '<div>' +
                        '<div class="message-content">' + text + '</div>' +
                        '<div class="message-time">' + time + '</div>' +
                    '</div>' +
                '</div>';
            
            var $typingIndicator = $('#typingIndicator');
            
            if ($typingIndicator.length > 0) {
                $typingIndicator.before(html);
            } else {
                $('#messagesArea').append(html);
            }
            
            scrollToBottom();
        }
        
        // ========================================
        // FUNÇÕES DE ENVIO DE DÚVIDA
        // ========================================
        
        function addBotMessageComBotaoDuvida(texto) {
            var time = getCurrentTime();
            var avatarFallback = gerarAvatarUrl(selectedSubject.teacher);
            var fotoFinal = selectedSubject.photo;
            
            var botaoHtml = '';
            if (isBotaoDuvidaHabilitado()) {
                botaoHtml = '' +
                    '<div class="mt-2">' +
                        '<button class="btn btn-primary btn-sm btn-enviar-duvida-professores">' +
                            '<i class="fas fa-paper-plane mr-1"></i> Enviar dúvida para nossa equipe' +
                        '</button>' +
                    '</div>';
            }
            
            var html = '' +
                '<div class="message bot">' +
                    '<img src="' + fotoFinal + '" ' +
                         'alt="' + selectedSubject.teacher + '" ' +
                         'class="teacher-photo-msg" ' +
                         'onerror="this.src=\'' + avatarFallback + '\'">' +
                    '<div>' +
                        '<div class="message-content">' + texto + botaoHtml + '</div>' +
                        '<div class="message-time">' + time + '</div>' +
                    '</div>' +
                '</div>';
            
            var $typingIndicator = $('#typingIndicator');
            
            if ($typingIndicator.length > 0) {
                $typingIndicator.before(html);
            } else {
                $('#messagesArea').append(html);
            }
            
            scrollToBottom();
        }
        
        function abrirModalEnviarDuvida() {
            // Preenche o preview da pergunta
            $('#previewPerguntaDuvida').text(ultimaPergunta);
            $('#inputAssuntoDuvida').val('Dúvida sobre o conteúdo');
            
            // Abre o modal
            $('#modalEnviarDuvida').modal('show');
        }
        
        function confirmarEnvioDuvida() {
            var assunto = $('#inputAssuntoDuvida').val().trim();
            
            if (!assunto) {
                $('#inputAssuntoDuvida').addClass('is-invalid');
                return;
            }
            
            $('#inputAssuntoDuvida').removeClass('is-invalid');
            
            // Desabilita o botão e mostra loading
            var $btn = $('#btnConfirmarEnvioDuvida');
            $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Enviando...');
            
            enviarDuvidaProfessores(assunto, ultimaPergunta);
        }
        
        function enviarDuvidaProfessores(assunto, mensagemOriginal) {
            var token = $('#token').val() || '';
            var idVideo = $('#idVideo').val() || '';
            var idDocumento = $('#idDocumento').val() || '';
            var tempo = $('#tempoVideo').val() || 0;
            
            var params = {
                tokenDuvida: token,
                idVideoDuvida: idVideo,
                idDocumentoDuvida: idDocumento,
                tempoDuvida: tempo,
                assunto: assunto,
                mensagem: mensagemOriginal
            };
            
            var url = window.ChatWidget.config.contextPath + '/portal/salvarDuvidaVideo';
            
            $.ajax({
                url: url,
                type: 'POST',
                data: params,
                success: function(resposta) {
                    // Fecha o modal
                    $('#modalEnviarDuvida').modal('hide');
                    
                    try {
                        var result = resposta;
                        if (typeof resposta === 'string') {
                            result = JSON.parse(resposta);
                        }
                        
                        if (result.status === 0) {
                            addBotMessage('<i class="fas fa-check-circle text-success mr-1"></i> Sua dúvida foi enviada com sucesso para os professores. Você receberá a resposta em breve.');
                        } else {
                            addBotMessage('<i class="fas fa-exclamation-circle text-warning mr-1"></i> ' + (result.mensagem || 'Não foi possível enviar sua dúvida. Tente novamente.'));
                        }
                        
                    } catch (e) {
                        console.error('Erro ao processar resposta:', e);
                        addBotMessage('<i class="fas fa-times-circle text-danger mr-1"></i> Erro ao processar resposta do servidor.');
                    }
                    
                    // Restaura o botão do modal
                    $('#btnConfirmarEnvioDuvida').prop('disabled', false).html('<i class="fas fa-paper-plane mr-1"></i>Enviar Dúvida');
                },
                error: function(xhr, status, error) {
                    console.error('Erro na requisição:', error);
                    
                    // Fecha o modal
                    $('#modalEnviarDuvida').modal('hide');
                    
                    addBotMessage('<i class="fas fa-times-circle text-danger mr-1"></i> Erro ao enviar dúvida. Por favor, tente novamente.');
                    
                    // Restaura o botão do modal
                    $('#btnConfirmarEnvioDuvida').prop('disabled', false).html('<i class="fas fa-paper-plane mr-1"></i>Enviar Dúvida');
                }
            });
        }
        
        function enviarMensagemServidor(userMessage) {
            if (!selectedSubject || !selectedSubject.id) {
                addBotMessage('Erro: Nenhum professor selecionado.');
                return;
            }
            
            $('#typingIndicator').addClass('active');
            scrollToBottom();
            
            var url = window.ChatWidget.config.contextPath + '/portal/professorai-pergunta';
            var dados = {
                idProfessor: selectedSubject.id,
                pergunta: userMessage
            };
            
            $.ajax({
                url: url,
                method: 'POST',
                dataType: 'json',
                data: dados,
                success: function(response) {
                    $('#typingIndicator').removeClass('active');
                    
                    var respostaTexto = '';
                    var found = true; // Por padrão considera que encontrou
                    
                    // Verifica se a resposta tem o campo output com found
                    if (response && response.output) {
                        found = response.output.found !== false; // Se found for false, não encontrou
                        
                        if (response.output.answer) {
                            respostaTexto = response.output.answer;
                        }
                    } else if (response && response.answer) {
                        respostaTexto = response.answer;
                        // Se tiver campo found no nível raiz
                        if (response.found === false) {
                            found = false;
                        }
                    } else if (response && response.resposta) {
                        respostaTexto = response.resposta;
                    } else if (typeof response === 'string') {
                        respostaTexto = response;
                    }
                    
                    // Se não encontrou resposta adequada
                    if (!found) {
                        var mensagemNaoEncontrada = 'Não encontramos uma resposta adequada para sua pergunta.';
                        addBotMessageComBotaoDuvida(mensagemNaoEncontrada);
                    } else if (respostaTexto) {
                        addBotMessage(respostaTexto);
                    } else {
                        // Fallback se não tiver texto mas found seja true
                        addBotMessage('Desculpe, não consegui processar sua pergunta.');
                    }
                    
                    $('#messageInput').prop('disabled', false);
                    $('#messageInput').focus();
                },
                error: function(xhr, status, error) {
                    $('#typingIndicator').removeClass('active');
                    
                    var mensagemErro = 'Desculpe, ocorreu um erro. Tente novamente.';
                    
                    if (xhr.status === 400) {
                        mensagemErro = 'Erro: Dados inválidos.';
                    } else if (xhr.status === 500) {
                        mensagemErro = 'Erro no servidor.';
                    }
                    
                    addBotMessage(mensagemErro);
                    
                    $('#messageInput').prop('disabled', false);
                    $('#messageInput').focus();
                }
            });
        }
        
        function scrollToBottom() {
            var messagesArea = $('#messagesArea');
            
            setTimeout(function() {
                messagesArea.animate({
                    scrollTop: messagesArea[0].scrollHeight
                }, 300);
            }, 100);
        }
        
        function getCurrentTime() {
            var now = new Date();
            var hours = now.getHours().toString();
            var minutes = now.getMinutes().toString();
            
            if (hours.length === 1) hours = '0' + hours;
            if (minutes.length === 1) minutes = '0' + minutes;
            
            return hours + ':' + minutes;
        }
        
        function escapeHtml(text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            
            return text.replace(/[&<>"']/g, function(m) {
                return map[m];
            });
        }
        
        // ========================================
        // API PÚBLICA
        // ========================================
        
        window.ChatWidget.open = function() {
            $('#chatContainer').addClass('active');
        };
        
        window.ChatWidget.close = function() {
            $('#chatContainer').removeClass('active');
        };
        
        window.ChatWidget.init = function(tokenProduto, contextPath) {
            if (typeof contextPath === 'undefined') {
                contextPath = '';
            }
            
            if (!tokenProduto || tokenProduto === 'null' || tokenProduto === '') {
                return;
            }
            
            inserirChatHTML();
            
            if (!chatInserido) {
                return;
            }
            
            window.ChatWidget.config.tokenProduto = tokenProduto;
            window.ChatWidget.config.contextPath = contextPath;
            
            carregarProfessores();
        };
        
        window.ChatWidget.limparCache = function() {
            if (window.ChatWidget.config.tokenProduto) {
                limparCache(window.ChatWidget.config.tokenProduto);
            }
        };
        
        window.ChatWidget.recarregar = function() {
            if (window.ChatWidget.config.tokenProduto) {
                limparCache(window.ChatWidget.config.tokenProduto);
                carregarProfessores();
            }
        };
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatWidget);
    } else {
        initChatWidget();
    }
})();