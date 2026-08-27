$(document).ready(function(){

var btn_checkout = $("#btn-checkout");
var btnpurchase = $("#btnpurchase");

btn_checkout.on('click', function(event){
	event.preventDefault();

	var id = $(this).attr('data-id');
	var preco = $(this).attr('preco');
	
	var buttonText = btn_checkout.html();

	$.ajax({
		url:'/checkout',
		type:'post',
		dataType:'json',
		data: 'id=' + id,
		beforeSend: function () {
			$(this).html('Aguarde, <i class="fa fa-spinner fa-spin fa-fw"></i>');
		},
		success: function(response){
			
			
			if (response == 'logado') {
				$(this).html(buttonText);
				swal('Atenção', 'Você precisa estar logado para adquirir esse curso, em 3 segundos você será redirecionado para logar-se!', 'info');

				setTimeout(() =>{
					window.location.href = '/login';
				}, 3000);
			}
			
			if (response == 'curso') {
				$(this).html(buttonText);
				swal('Atenção', 'Escolha um curso para fechar o pedido', 'info');
			}
			
			if (response == 'erro') {
				$(this).html(buttonText);
				swal('Atenção', 'Ocorreu um erro ao fechar o pedido', 'info');
			}
			
			if (response.status == 'success') {
				$(this).html(buttonText);
				
				swal('Sucesso', 'O pedidio foi feito com sucesso, em 5 segundos você será redirecionado para o checkout de pagamento!', 'success');

				setTimeout(() =>{
					window.location.href = response.url;
				}, 5000);
			}

		}
	});
});

btnpurchase.on('click', function(event){
	event.preventDefault();

	var id = $(this).attr('data-id');
	var buttonText = btnpurchase.html();

	$.ajax({
		url:'/checkout',
		type:'post',
		dataType:'json',
		data: 'id=' + id,
		beforeSend: function () {
			$(this).html('Aguarde, <i class="fa fa-spinner fa-spin fa-fw"></i>');
		},
		success: function(response){
			
			
			if (response == 'logado') {
				$(this).html(buttonText);
				swal('Atenção', 'Você precisa estar logado para adquirir esse curso, em 3 segundos você será redirecionado para logar-se!', 'info');

				setTimeout(() =>{
					window.location.href = '/login';
				}, 3000);
			}
			
			if (response == 'curso') {
				$(this).html(buttonText);
				swal('Atenção', 'Escolha um curso para fechar o pedido', 'info');
			}
			
			if (response == 'erro') {
				$(this).html(buttonText);
				swal('Atenção', 'Ocorreu um erro ao fechar o pedido', 'info');
			}
			
			if (response.status == 'success') {
				$(this).html(buttonText);
				
				swal('Sucesso', 'O pedidio foi feito com sucesso, em 5 segundos você será redirecionado para o pagseguro', 'success');

				setTimeout(() =>{
					window.location.href = response.url;
				}, 5000);
			}

		}
	});
});
});