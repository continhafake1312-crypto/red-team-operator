$('#btnAdicionarProduto').click(function() {
    $('#btnAdicionar').html('<div>Aguarde Carregando</div>');
    $('#btnAdicionar').attr('disabled', true);
	var rowCount = $('#tbodyProdutos tr').length + 1;

    $.getJSON("/portal/getProdutos", {format: "json", tipoProduto: "'A','L'"}).done(function(data) {
        adicionarLinha(rowCount, 0, '', '', '', '', 'A', data);
        $('#btnAdicionar').attr('disabled', false);
        $('#btnAdicionar').html('<i class="fa fa-plus"></i>');
    });
});
	
function adicionarLinha(indice, idProduto, quantidade, valor, valorDesconto, valorTotal, situacao, listaProdutos) {
	
	var linha = '<tr>';
    linha += '<td style="width: 10px;padding-top: 15px;">' + indice + '</td>';
    linha += '<td>';
    linha += '<select id="itemProduto' + indice + '" name="itemProduto" class="form-control" onchange="selecionaItemProduto(' + indice + ')">';
    linha += '<option value="">Selecione um Produto</option>';
    for ( var i = 0; i < listaProdutos.length; i++) {
    	if (listaProdutos[i].id == idProduto) {
            linha += '<option value="' + listaProdutos[i].id + '" selected>' + listaProdutos[i].nome + '</option>';
    	} else {
            linha += '<option value="' + listaProdutos[i].id + '">' + listaProdutos[i].nome + '</option>';
    	}
    }
    linha += '<option>Apostila Pré-Militar Apostila</option>';
    linha += '</select>';
    linha += '</td>';
    linha += '<td>';
    linha += '<input type="text" name="itemQuantidade" id="itemQuantidade' + indice + '" onchange="calculaItemValor(' + indice + ')" value="' + quantidade + '" maxlength="10" size="10" class="form-control">';
    linha += '</td>';
    linha += '<td>';
    linha += '<input type="text" name="itemValor" id="itemValor' + indice + '" maxlength="10" size="10" value="' + valor + '" readonly="readonly" class="form-control">';
    linha += '</td>';
    linha += '<td>';
    linha += '<input type="text" name="itemValorTotal"  id="itemValorTotal' + indice + '" maxlength="10" size="10" value="" readonly="readonly" class="form-control">';
    linha += '</td>';
    linha += '<td>';
    linha += '<button type="button" name="btnRemoverProduto" id="btnRemoverProduto' + indice + '" value="Remover" class="btn btn-info btn-flat"><i class="fal fa-trash-alt" onclick="removerProduto(this)"></i></button>';
    linha += '</td>';
    linha += '</tr>';
    $("#tbodyProdutos").append(linha); 
    $('#itemQuantidade' + indice).mask('00000');
}

function removerProduto(campo) {
    if (confirm('Você tem certeza que deseja excluir este produto?')) {
        $(campo).closest("tr").remove();
    }
}

function selecionaItemProduto(indice) {
    $.getJSON("/portal/getValorProduto", {format: "json", idProduto: $('#itemProduto' + indice).val()}).done(function(data) {
        $('#itemValor' + indice).val(data);
        calculaItemValor(indice);
    });
}

function calculaItemValor(indice) {
    if ($('#itemValor' + indice).val() == '') return;
    if ($('#itemQuantidade' + indice).val() == '') return;
	var valor = parseInt($('#itemQuantidade' + indice).val()) * moeda2float($('#itemValor' + indice).val());
	$('#itemValorTotal' + indice).val(float2moeda(valor));
}

$('#btnPedidoSave').click(function() {
    if(!$("#PedidoForm").valid()){
        return;
    }

    var rowCount = $('#tbodyProdutos tr').length + 1;
    if (rowCount <= 1) {
        alert('É necessário enviar os produtos e suas quantidades. Clique no botão + e adicione um produto.')
        return;
    }
    
    for (var i = 1; i <= rowCount; i++) {
        if ($('#itemQuantidade' + i).val() == '') {
            alert("O campo Quantidade da linha " + i + " deve ser preenchido");
            return false
        }

        for (var j = 1; j <= rowCount; j++) {
            if (i != j && $('#itemProduto' + i).val() == $('#itemProduto' + j).val()) {
                alert('Não pode colocar 2 linhas com produtos iguais. Neste caso deve colocar 1 produto com o total desejado.')
                return;
            }
        }
    }
    
    $.post("/portal/salvarPedido", $("#PedidoForm").serialize(), function (data) {
    	if (data.status == 0) {
   	    	location.href= data.message;
   		} else {
   			alert(data.message);
   		}
    }, 'json');
});

$(function () {
    if ($('#idPedido') != null && $('#idPedido').val() != null && $('#idPedido').val().length > 0) {
        $.getJSON("/portal/getProdutos", {format: "json", tipoProduto: "'A','L'"}).done(function(data1) {
            $.getJSON("/portal/getItemPedido", {format: "json", idPedido: $('#idPedido').val()}).done(function(data2) {
                $.each( data2, function( i, item ) {
                    adicionarLinha((i + 1), item.idProduto, item.quantidade, item.valor / item.quantidade, item.valorDesconto, item.valor, item.situacao, data1);
                    calculaItemValor((i + 1));
                });
            });
        });
    }
});
