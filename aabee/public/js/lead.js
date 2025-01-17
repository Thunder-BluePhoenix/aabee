// frappe.ui.form.on('Lead', {
//     refresh: function(frm) {
//         frm.add_custom_button('Call Customer', function() {
//             frappe.call({
//                 method: 'aabee.telecmi.telecmi.initiate_full_process',
//                 callback: function(response) {
//                     if (response.message) {
//                         frappe.msgprint('Call initiated successfully!');
//                     }
//                 }
//             });
//         });
//     }
// });



frappe.ui.form.on('Lead', {
    refresh: function(frm) {
        console.log("Lead form refresh");
        if (frm.doc.phone) {
            console.log("Phone number exists:", frm.doc.phone);
            frm.add_custom_button(__('Call'), async function() {
                console.log("Call button clicked");
                try {
                    if (frappe.telecmi && frappe.telecmi.piopiy) {
                        console.log("Attempting to make call to:", frm.doc.phone);
                        // Wait for the make_call function to complete
                        await frappe.telecmi.make_call(frm.doc.phone);
                    } else {
                        console.error("Telecmi or PIOPIY not initialized");
                        frappe.show_alert({
                            message: 'Telecmi not initialized properly. Please refresh the page.',
                            indicator: 'red'
                        });
                    }
                } catch (error) {
                    console.error("Error making call:", error);
                    frappe.show_alert({
                        message: 'Error making call: ' + error.message,
                        indicator: 'red'
                    });
                }
            }, __('Telecmi'));
        }
    }
});