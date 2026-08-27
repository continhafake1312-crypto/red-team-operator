$(document).ready(function () {

	

	var btn_cupom = $("#btn-cupom");

	
	var valorcurso = (document.getElementById("valorcurso").value);

	btn_cupom.on('click', function (event) {
		event.preventDefault();

		var cupom = (document.getElementById("cupom-input").value);

		var loading = $("#loading");

		$.ajax({
			url: '/find_cupom',
			dataType: 'json',
			data: 'cupom=' + cupom + '&valorcurso=' + valorcurso,
			type: 'POST',
			success: function (response) {

				if (response.status == 'success') {

					if (response.dados.type == 1) {
						loading.html('<br/> <h5>Desconto de ' + response.dados.discount + '% </h5>\n\
<h5><strong>Valor do curso com desconto R$ '+ response.desconto + ' </strong></h5>');

					}
					if (response.dados.type == 2) {
						loading.html('<br/> <h5>Desconto de R$ ' + response.dados.discount + ',00 </h5>\n\
<h5><strong>Valor do curso com desconto R$ '+ response.desconto + ' </strong></h5>');

					}
				}
				if (response.status == 'negado') {
					swal('Erro', 'Cupom inválido!', 'error');
				}

			}
		});

	});

});