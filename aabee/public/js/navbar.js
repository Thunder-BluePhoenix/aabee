
frappe.provide('frappe.custom_selector');

const style = document.createElement('style');
style.textContent = `
    .custom-selector-wrapper {
        display: inline-flex;
        align-items: center;
        margin-left: 10px;
        position: relative;
    }
    /* ... rest of your existing styles ... */
`;
document.head.appendChild(style);

frappe.custom_selector.CustomSelector = class CustomSelector {
    constructor() {
        this.setup();
        this.bind_events();
        this.restore_option();
        this.current_user = frappe.session.user;
    }

    setup() {
        this.create_selector();
        // Subscribe to employee doctype changes
        frappe.realtime.on('employee_update', this.handle_employee_update.bind(this));
    }

    create_selector() {
        const $searchBar = $('.search-bar');

        this.$wrapper = $(`
            <div class="custom-selector-wrapper">
                <div class="dropdown">
                    <button class="btn btn-custom" type="button" data-toggle="dropdown">
                        <i class="fa fa-folder-o custom-icon"></i>
                        <span class="custom-label">Select FollowMe Status</span>
                        <i class="fa fa-chevron-down custom-icon"></i>
                    </button>
                    <ul class="dropdown-menu custom-list dropdown-menu-right">
                        <li><a href="#" data-value="FollowMe On">FollowMe On</a></li>
                        <li><a href="#" data-value="FollowMe Off">FollowMe Off</a></li>
                    </ul>
                </div>
            </div>
        `).insertAfter($searchBar);

        this.$custom_list = this.$wrapper.find('.custom-list');
        this.$custom_label = this.$wrapper.find('.custom-label');
    }

    bind_events() {
        this.$custom_list.on('click', 'li a', (e) => {
            e.preventDefault();
            const selectedValue = $(e.currentTarget).data('value');
            this.set_option(selectedValue);
        });

        if (cur_frm && cur_frm.doctype === 'Employee') {
            cur_frm.doc.onchange = () => this.sync_selector_with_form();
        }
    }

    async set_option(value) {
        try {
            this.$custom_label.text(value);
            localStorage.setItem('custom_selector_value', value);

            const isFollowMeOn = value === 'FollowMe On';
            await this.update_employee_followme(isFollowMeOn);

            // Refresh the form if we're on the employee page
            if (cur_frm && cur_frm.doctype === 'Employee') {
                cur_frm.reload_doc();
            }

            frappe.show_alert({
                message: __('FollowMe status updated successfully'),
                indicator: 'green'
            });
        } catch (error) {
            frappe.show_alert({
                message: __('Failed to update FollowMe status: ' + error.message),
                indicator: 'red'
            });
            console.error('Error updating FollowMe status:', error);
        }
    }

    async update_employee_followme(isFollowMeOn) {
        const employee = await this.get_employee_for_user();
        
        if (!employee) {
            throw new Error('No employee record found for current user');
        }

        const doc = await frappe.db.get_doc('Employee', employee);
        
        await frappe.xcall('frappe.client.set_value', {
            doctype: 'Employee',
            name: employee,
            fieldname: 'custom_follow_me_',
            value: isFollowMeOn ? 1 : 0
        });

        // Trigger a realtime update
        frappe.realtime.publish('employee_update', {
            employee: employee,
            custom_follow_me_: isFollowMeOn
        });
    }

    async get_employee_for_user() {
        const result = await frappe.call({
            method: 'frappe.client.get_value',
            args: {
                doctype: 'Employee',
                filters: { user_id: this.current_user },
                fieldname: ['name', 'custom_follow_me_']
            }
        });

        return result.message?.name;
    }

    handle_employee_update(data) {
        if (cur_frm && cur_frm.doctype === 'Employee') {
            cur_frm.reload_doc();
        }
        
        // Update selector to match the current document state
        const value = data.custom_follow_me_ ? 'FollowMe On' : 'FollowMe Off';
        this.$custom_label.text(value);
        localStorage.setItem('custom_selector_value', value);
    }

    sync_selector_with_form() {
        if (cur_frm && cur_frm.doc.custom_follow_me_ !== undefined) {
            const value = cur_frm.doc.custom_follow_me_ ? 'FollowMe On' : 'FollowMe Off';
            this.$custom_label.text(value);
            localStorage.setItem('custom_selector_value', value);
        }
    }

    async restore_option() {
        try {
            // Get the current state from the employee document
            const result = await frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    doctype: 'Employee',
                    filters: { user_id: this.current_user },
                    fieldname: 'custom_follow_me_'
                }
            });

            const followMeEnabled = result.message?.custom_follow_me_;
            const value = followMeEnabled ? 'FollowMe On' : 'FollowMe Off';
            
            this.$custom_label.text(value);
            localStorage.setItem('custom_selector_value', value);
        } catch (error) {
            console.error('Error restoring FollowMe status:', error);
            
            // Fallback to localStorage if database fetch fails
            const savedValue = localStorage.getItem('custom_selector_value');
            if (savedValue) {
                this.$custom_label.text(savedValue);
            }
        }
    }
};

$(document).ready(function() {
    frappe.custom_selector.instance = new frappe.custom_selector.CustomSelector();
});