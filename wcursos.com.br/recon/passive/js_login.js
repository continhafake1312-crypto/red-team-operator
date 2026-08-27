$().ready(function() {
	$("#form-new-user").validate({
		rules: {
			cpf: {
				cpfcnpj: true,
				minlength: 11
			}
		},
		submitHandler: function(form) {
			if ($("#recaptchav3").length > 0) {
				grecaptcha.ready(function() {
					grecaptcha.execute($('#recaptchav3').data('recaptcha-sitekey'), { action: 'submit' }).then(function(token) {
						$('#g-recaptcha-response').val(token);
						form.submit();
					});
				});
			} else {
				form.submit();
			}
		}
	});
});

