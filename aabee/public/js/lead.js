frappe.ui.form.on('Lead', {
    refresh: function(frm) {
        frm.add_custom_button('Call Customer', function() {
            frappe.call({
                method: 'aabee.telecmi.telecmi.initiate_full_process',
                callback: function(response) {
                    if (response.message) {
                        frappe.msgprint('Call initiated successfully!');
                    }
                }
            });
        });
    }
});
