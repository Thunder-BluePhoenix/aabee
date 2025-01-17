// frappe.provide('frappe.telecmi');

// frappe.telecmi = {
//     init: function() {
//         console.log("Initializing Telecmi...");
//         this.settings = null;
//         this.piopiy = null;
//         this.load_settings();
//     },

//     load_settings: function() {
//         console.log("Loading Telecmi settings...");
//         frappe.call({
//             method: 'aabee.telecmi.telecmi.get_telecmi_settings',
//             callback: (r) => {
//                 if (r.message) {
//                     console.log("Settings loaded");
//                     this.settings = r.message;
//                     this.setup_piopiy();
//                 }
//             }
//         });
//     },

//     setup_piopiy: function() {
//         console.log("Setting up PIOPIY...");
//         try {
//             this.piopiy = new PIOPIY({
//                 name: this.settings.display_name,
//                 debug: true,  // Enable debug for now
//                 autoplay: true,
//                 ringTime: 60
//             });
//             this.setup_event_handlers();
//             this.login();
//         } catch (e) {
//             console.error("Error setting up PIOPIY:", e);
//             frappe.throw(__('Error initializing Telecmi. Check console for details.'));
//         }
//     },

//     setup_call_dialog: function() {
//         this.call_dialog = new frappe.ui.Dialog({
//             title: 'Incoming Call',
//             fields: [
//                 {
//                     fieldname: 'caller_info',
//                     fieldtype: 'HTML'
//                 },
//                 {
//                     fieldname: 'actions_html',
//                     fieldtype: 'HTML'
//                 }
//             ]
//         });

//         // Add custom buttons container
//         this.call_dialog.$wrapper.find('.modal-dialog')
//             .css('max-width', '300px');
        
//         let actions_html = `
//             <div class="telecmi-call-actions text-center">
//                 <button class="btn btn-success mr-2 btn-answer">
//                     <i class="fa fa-phone"></i> Answer
//                 </button>
//                 <button class="btn btn-danger btn-hangup">
//                     <i class="fa fa-phone-slash"></i> Hangup
//                 </button>
//             </div>
//         `;
        
//         this.call_dialog.get_field('actions_html').$wrapper.html(actions_html);
        
//         // Bind button actions
//         this.call_dialog.$wrapper.find('.btn-answer').on('click', () => {
//             this.answer_call();
//         });
        
//         this.call_dialog.$wrapper.find('.btn-hangup').on('click', () => {
//             this.hangup();
//         });
//     },

//     login: function() {
//         console.log("Logging in to Telecmi...");
//         this.piopiy.login(
//             this.settings.user_id,
//             this.settings.password,
//             this.settings.sbc_uri
//         );
//     },


//     setup_event_handlers: function() {
//         console.log("Setting up event handlers...");
        
//         // Existing login handlers...
    
//         this.piopiy.on("error", function(obj) {
//             console.error("Telecmi error:", obj);
//             frappe.show_alert({
//                 message: 'Call error: ' + (obj.message || 'Unknown error'),
//                 indicator: 'red'
//             });
//         });
    
//         this.piopiy.on("ended", function(obj) {
//             console.log("Call ended:", obj);
//             frappe.show_alert({
//                 message: 'Call ended',
//                 indicator: 'yellow'
//             });
//         });
    
//         this.piopiy.on("failed", function(obj) {
//             console.error("Call failed:", obj);
//             frappe.show_alert({
//                 message: 'Call failed',
//                 indicator: 'red'
//             });
//         });
//     },

    

//     make_call: function(number) {
//         console.log("make_call function called with number:", number);
//         return new Promise((resolve, reject) => {
//             try {
//                 if (!this.piopiy) {
//                     throw new Error('Telecmi not initialized');
//                 }
    
//                 // Format number if needed
//                 if (!number.startsWith('+91') && !number.startsWith('91')) {
//                     number = '91' + number.replace(/\D/g, '');
//                 }
//                 console.log("Formatted number for call:", number);
    
//                 // Make the call
//                 this.piopiy.call(number);
                
//                 // Add call event handlers
//                 this.piopiy.on("trying", function(obj) {
//                     console.log("Call trying:", obj);
//                     if (obj.code == 100) {
//                         frappe.show_alert({
//                             message: 'Initiating call...',
//                             indicator: 'blue'
//                         });
//                     }
//                 });
    
//                 this.piopiy.on("ringing", function(obj) {
//                     console.log("Call ringing:", obj);
//                     if (obj.code == 183) {
//                         frappe.show_alert({
//                             message: 'Phone ringing...',
//                             indicator: 'blue'
//                         });
//                     }
//                 });
    
//                 this.piopiy.on("answered", function(obj) {
//                     console.log("Call answered:", obj);
//                     if (obj.code == 200) {
//                         frappe.show_alert({
//                             message: 'Call connected',
//                             indicator: 'green'
//                         });
//                     }
//                 });
    
//                 resolve();
//             } catch (error) {
//                 console.error("Error in make_call:", error);
//                 reject(error);
//             }
//         });
//     }
// };

// $(document).ready(function() {
//     console.log("Document ready, initializing Telecmi...");
//     frappe.telecmi.init();
// });




//main function
// frappe.provide('frappe.telecmi');

// frappe.telecmi = {
//     init: function() {
//         console.log("Initializing Telecmi...");
//         this.settings = null;
//         this.piopiy = null;
//         this.call_dialog = null;
//         this.load_settings();
//     },

//     setup_call_dialog: function() {
//         console.log("Setting up call dialog");
        
//         // Create dialog if it doesn't exist
//         if (!this.call_dialog) {
//             this.call_dialog = new frappe.ui.Dialog({
//                 title: 'Incoming Call',
//                 fields: [
//                     {
//                         fieldname: 'caller_info_html',
//                         fieldtype: 'HTML'
//                     }
//                 ],
//                 primary_action_label: 'Answer',
//                 primary_action: () => {
//                     console.log("Answering call...");
//                     this.answer_call();
//                 },
//                 secondary_action_label: 'Reject',
//                 secondary_action: () => {
//                     console.log("Rejecting call...");
//                     this.reject_call();
//                 }
//             });
//         }
//     },

//     load_settings: function() {
//         console.log("Loading Telecmi settings...");
//         frappe.call({
//             method: 'aabee.telecmi.telecmi.get_telecmi_settings',
//             callback: (r) => {
//                 if (r.message) {
//                     console.log("Settings loaded");
//                     this.settings = r.message;
//                     this.setup_piopiy();
//                 }
//             }
//         });
//     },

//     setup_piopiy: function() {
//         console.log("Setting up PIOPIY...");
//         try {
//             this.piopiy = new PIOPIY({
//                 name: this.settings.display_name,
//                 debug: true,
//                 autoplay: true,
//                 ringTime: 60,
//                 pcConfig: {
//                     iceServers: [
//                         { urls: 'stun:stun.l.google.com:19302' }
//                     ]
//                 }
//             });
//             this.setup_event_handlers();
//             this.login();
//         } catch (e) {
//             console.error("Error setting up PIOPIY:", e);
//             frappe.throw(__('Error initializing Telecmi. Check console for details.'));
//         }
//     },

//     setup_incoming_call_dialog: function(call_number, call_data) {
//         console.log("Setting up incoming call dialog for:", call_number);
    
//         // Check if dialog already exists
//         if (!this.call_dialog) {
//             this.call_dialog = new frappe.ui.Dialog({
//                 title: 'Incoming Call',
//                 fields: [
//                     { fieldname: 'call_info', fieldtype: 'HTML' },
//                     { fieldname: 'call_actions', fieldtype: 'HTML' }
//                 ]
//             });
//         }
    
//         const call_info_html = `
//             <div class="text-center">
//                 <h4>Incoming Call: ${call_number}</h4>
//             </div>`;
//         const call_actions_html = `
//             <div class="telecmi-call-actions text-center">
//                 <button class="btn btn-success btn-answer">
//                     <i class="fa fa-phone"></i> Answer
//                 </button>
//                 <button class="btn btn-danger btn-reject">
//                     <i class="fa fa-phone-slash"></i> Reject
//                 </button>
//             </div>`;
    
//         this.call_dialog.get_field('call_info').$wrapper.html(call_info_html);
//         this.call_dialog.get_field('call_actions').$wrapper.html(call_actions_html);
    
//         // Bind button actions
//         this.call_dialog.$wrapper.find('.btn-answer').on('click', () => this.answer_call(call_data));
//         this.call_dialog.$wrapper.find('.btn-reject').on('click', () => this.reject_call(call_data));
    
//         this.call_dialog.show();
//     },

//     setup_call_dialog: function(call_number) {
//         console.log("Setting up call dialog for:", call_number);

//         if (!this.call_dialog) {
//             this.call_dialog = new frappe.ui.Dialog({
//                 title: 'Call in Progress',
//                 fields: [
//                     { fieldname: 'call_info', fieldtype: 'HTML' },
//                     { fieldname: 'call_actions', fieldtype: 'HTML' }
//                 ]
//             });
//         }

//         const call_info_html = `
//             <div class="text-center">
//                 <h4>Calling: ${call_number}</h4>
//             </div>`;
//         const call_actions_html = `
//             <div class="telecmi-call-actions text-center">
//                 <button class="btn btn-danger btn-hangup">
//                     <i class="fa fa-phone-slash"></i> Hangup
//                 </button>
//                 <button class="btn btn-warning btn-hold">
//                     <i class="fa fa-pause"></i> Hold
//                 </button>
//                 <button class="btn btn-primary btn-merge">
//                     <i class="fa fa-link"></i> Merge
//                 </button>
//                 <button class="btn btn-success btn-record">
//                     <i class="fa fa-circle"></i> Record
//                 </button>
//             </div>`;

//         this.call_dialog.get_field('call_info').$wrapper.html(call_info_html);
//         this.call_dialog.get_field('call_actions').$wrapper.html(call_actions_html);

//         // Bind button actions
//         this.call_dialog.$wrapper.find('.btn-hangup').on('click', () => this.hangup());
//         this.call_dialog.$wrapper.find('.btn-hold').on('click', () => this.piopiy.hold());
//         this.call_dialog.$wrapper.find('.btn-merge').on('click', () => this.piopiy.merge());
//         this.call_dialog.$wrapper.find('.btn-record').on('click', () => this.record_call());

//         this.call_dialog.show();
//     },

//     record_call: function() {
//         console.log("Recording call...");
//         frappe.show_alert({ message: 'Call recording started', indicator: 'blue' });
//         // Implement recording logic here (e.g., use a backend service).
//     },

//     login: function() {
//         console.log("Logging in to Telecmi...");
//         this.piopiy.login(
//             this.settings.user_id,
//             this.settings.password,
//             this.settings.sbc_uri
//         );
//     },

//     make_call: function(number) {
//         console.log("make_call function called with number:", number);
//         if (!this.piopiy) {
//             frappe.throw(__('Telecmi not initialized'));
//         }

//         // Format number
//         if (!number.startsWith('+91') && !number.startsWith('91')) {
//             number = '91' + number.replace(/\D/g, '');
//         }
//         console.log("Formatted number for call:", number);

//         // Show the call popup
//         this.setup_call_dialog(number);

//         // Make the call
//         this.piopiy.call(number);

//         this.piopiy.on("trying", function(obj) {
//             console.log("Call trying:", obj);
//             frappe.show_alert({ message: 'Dialing...', indicator: 'blue' });
//         });
//     },

//     hangup: function() {
//         console.log("Hanging up call...");
//         this.piopiy.terminate();
//         frappe.show_alert({ message: 'Call ended', indicator: 'red' });
//         this.call_dialog.hide();
//     },
//     answer_call: function(call_data) {
//         console.log("Answering call:", call_data);
//         this.piopiy.answer();
//         frappe.show_alert({ message: 'Call answered', indicator: 'green' });
//         this.call_dialog.hide();
//     },
    
//     reject_call: function(call_data) {
//         console.log("Rejecting call:", call_data);
//         this.piopiy.terminate();
//         frappe.show_alert({ message: 'Call rejected', indicator: 'red' });
//         this.call_dialog.hide();
//     },
    

//     setup_event_handlers: function() {
//         console.log("Setting up event handlers...");
//         console.log("Setting up event handlers...");
//         let me = this;

//         // Try all possible event name variations
//         this.piopiy.on("inComingCall", function(obj) {
//             console.log("inComingCall event received:", obj);
//             handleIncomingCall(obj);
//         });

//         this.piopiy.on("incomingcall", function(obj) {
//             console.log("incomingcall event received:", obj);
//             handleIncomingCall(obj);
//         });

//         this.piopiy.on("incoming_call", function(obj) {
//             console.log("incoming_call event received:", obj);
//             handleIncomingCall(obj);
//         });

//         function handleIncomingCall(obj) {
//             frappe.show_alert({
//                 message: 'Incoming call received',
//                 indicator: 'blue'
//             });

//             if (!me.call_dialog) {
//                 me.call_dialog = new frappe.ui.Dialog({
//                     title: 'Incoming Call',
//                     fields: [
//                         {
//                             fieldname: 'caller_info',
//                             fieldtype: 'HTML',
//                             options: `
//                                 <div class="text-center">
//                                     <h3>Incoming Call from</h3>
//                                     <h2>${obj.from || 'Unknown'}</h2>
//                                 </div>
//                             `
//                         }
//                     ],
//                     primary_action_label: 'Answer',
//                     primary_action: () => {
//                         me.piopiy.answer();
//                         me.call_dialog.hide();
//                     },
//                     secondary_action_label: 'Reject',
//                     secondary_action: () => {
//                         me.piopiy.reject();
//                         me.call_dialog.hide();
//                     }
//                 });
//             }

//             me.call_dialog.show();
//         }

//         // Log all events to debug
//         let events = [
//             "trying", "ringing", "answered", "ended", "failed", 
//             "connecting", "connected", "disconnected"
//         ];

//         events.forEach(event => {
//             this.piopiy.on(event, function(obj) {
//                 console.log(`Event ${event} received:`, obj);
//             });
//         });
       

      
        
        
//         this.piopiy.on("answered", (obj) => {
//             console.log("Call answered:", obj);
//             frappe.show_alert({ message: 'Call connected', indicator: 'green' });
//         });

//         this.piopiy.on("ended", (obj) => {
//             console.log("Call ended:", obj);
//             this.log_call(obj);
//             this.call_dialog.hide();
//         });

//         this.piopiy.on("failed", (obj) => {
//             console.error("Call failed:", obj);
//             frappe.show_alert({ message: 'Call failed', indicator: 'red' });
//             this.call_dialog.hide();
//         });
        
        
//     },

// };

// $(document).ready(function() {
//     console.log("Document ready, initializing Telecmi...");
//     frappe.telecmi.init();
// });


