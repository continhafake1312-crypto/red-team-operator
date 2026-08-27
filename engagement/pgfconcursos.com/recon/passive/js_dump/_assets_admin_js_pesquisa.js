$( document ).ready(function() {

	function enviaPesquisa(){
		var nomePesquisa = $('.campo-pesquisa').val();

		// Pesquisa com o campo CPF.
		if($('.campo-pesquisa-cpf').length){
			var location = $('.pesquisa-destino').val();

			if($('.campo-pesquisa').val().length > 0){
				location += 'pesquisa/' + $('.campo-pesquisa').val() + '/';
			}

			if($('.campo-pesquisa-cpf').val().length > 0){
				location += 'cpf/' + $('.campo-pesquisa-cpf').val();
			}

			window.location.href = location;		
		}
		// Pesquisa apenas pelo nome.
		else{
			window.location.href = $('.pesquisa-destino').val() + nomePesquisa;		
		}
	}

	$('.botao-pesquisa').click(function(){
		enviaPesquisa();
	});

	$('.campo-pesquisa').keyup(function(e){
	    if(e.keyCode == 13)
	    {
	    	enviaPesquisa();
	    }
	});

	$('.campo-pesquisa-cpf').keyup(function(e){
	    if(e.keyCode == 13)
	    {
	    	enviaPesquisa();
	    }
	});


});