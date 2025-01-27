



frappe.ui.form.on('Call Log', {
    refresh: function(frm) {
        if(frm.doc.recording_url) {
           
            frm.add_custom_button(__('Play Recording'), function() {
                window.open(frm.doc.recording_url, '_blank');
            });
        }
    }
});