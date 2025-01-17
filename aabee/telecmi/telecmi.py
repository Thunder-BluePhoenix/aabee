



import requests
import frappe



import requests
import frappe

import requests
import frappe

@frappe.whitelist()
def initiate_full_process():
   
    user_id = "1234_33334993"
    password = "123456"
    app_id = 33334993
    app_secret = "b6cadca2-f98f-4f2e-bef9-883656825298"
    to_number = 918670972005
    caller_id = 911203203903

    user_token_url = "https://rest.telecmi.com/v2/user/login"
    user_payload = {
        "id": user_id,
        "password": password
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        user_response = requests.post(user_token_url, json=user_payload, headers=headers)
        print(user_response,"user_response")
        user_response.raise_for_status()
        print("kkkkkkkkkkkkkkkkk")
        user_data = user_response.json()
        print(user_data,"user_data")
        
        if user_data.get("code") != 200:
            return {"status": "error", "message": "Failed to generate user token"}
        print("000000000000000000000000000")
        user_token = user_data.get("token")
        print(user_token,"user_token")
    except Exception as e:
        return {"status": "error", "message": f"Error in Step 1: {str(e)}"}

    # Step 2: Generate App Token
    app_token_url = "https://rest.telecmi.com/v2/token"
    app_payload = {
        "appid": app_id,
        "secret": app_secret
    }
    
    try:
        app_response = requests.post(app_token_url, json=app_payload, headers=headers)
        print(app_response,"app_response")
        app_response.raise_for_status()
        app_data = app_response.json()
        print(app_data,"app_data")

        if app_data.get("code") != 200:
            return {"status": "error", "message": "Failed to generate app token"}
        
        # app_token = app_data.get("secret")
        # print(app_token,"app_token")
    except Exception as e:
        return {"status": "error", "message": f"Error in Step 2: {str(e)}"}

    # Step 3: Initiate Click-to-Call
    click_to_call_url = "https://rest.telecmi.com/v2/ind/click2call"
    click_to_call_payload = {
        "token": user_token,
        "to": to_number,
        "extra_params": {"crm": "true"},
        "callerid": caller_id
    }
    
    try:
        call_response = requests.post(click_to_call_url, json=click_to_call_payload, headers=headers)
        print(call_response,"call_response")
        print("call started")
        call_response.raise_for_status()
        call_data = call_response.json()
        print(call_data)

        if call_data.get("code") != 200:
            return {"status": "error", "message": "Failed to initiate call"}
        
        print("funciton working successfully")
        return {"status": "success", "message": "Call initiated successfully", "data": call_data}

    except Exception as e:
        return {"status": "error", "message": f"Error in Step 3: {str(e)}"}




@frappe.whitelist()
def get_telecmi_settings():
    user_id = "1234_33334993"
    password = "123456"
    display_name = "Test"
    uri = "sbcind.telecmi.com"
    return {
        'user_id': user_id,
        'password': password,
        'sbc_uri': uri,
        'display_name': display_name
    }



import frappe
import requests
import json

def fetch_and_store_call_records(method=None, *args, **kwargs):
    user_id = "1234_33334993"
    password = "123456"
    from_t = 1569911400000
    to_t = 1737108600000
    page=1
    limit=10
   

    user_token_url = "https://rest.telecmi.com/v2/user/login"
    user_payload = {
        "id": user_id,
        "password": password
    }
    headers = {"Content-Type": "application/json"}

    user_response = requests.post(user_token_url, json=user_payload, headers=headers)
    print(user_response,"user_response")
    user_response.raise_for_status()
    print("kkkkkkkkkkkkkkkkk")
    user_data = user_response.json()
    print(user_data,"user_data")
    
    if user_data.get("code") != 200:
        return {"status": "error", "message": "Failed to generate user token"}
    print("000000000000000000000000000")
    user_token = user_data.get("token")
    print(user_token,"user_token")
    url = "https://rest.telecmi.com/v2/user/out_cdr"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "type": 0,  
        "token": user_token,
        "from": from_t,
        "to": to_t,
        "page": page,
        "limit": limit
    }
    print(payload,"payload")
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response_data = response.json()
        print(response_data,"response_data")

        if response.status_code == 200 and "cdr" in response_data:
            call_records = response_data["cdr"]

            for call in call_records:
                # Check if the call record already exists in the Call Log doctype
                if not frappe.db.exists("Call Log", {"id": call.get("cmiuid")}):
                    new_call_log = frappe.get_doc({
                        "doctype": "Call Log",
                        "id": call.get("cmiuid"),
                        # "type": "Missed" if call.get("duration") == 0 else "Answered",
                        "type": "Outgoing",
                        "to": str(call.get("to")),
                        "from": call.get("from"),
                        "duration": call.get("duration"),
                        "billed_duration": call.get("billedsec"),
                        "rate": call.get("rate"),
                        "time": frappe.utils.format_datetime(call.get("time") / 1000),
                        "notes": json.dumps(call.get("notes", []))
                    })

                    # Insert the new Call Log record into the database
                    new_call_log.insert(ignore_permissions=True)

            frappe.db.commit()
            # frappe.msgprint(f"{len(call_records)} call records added successfully.")

        else:
            frappe.throw(f"Failed to fetch call records. Error: {response_data.get('message', 'Unknown Error')}")

    except requests.exceptions.RequestException as e:
        frappe.throw(f"Error connecting to TeleCMI API: {str(e)}")
    except ValueError as e:
        frappe.throw(f"Error processing API response: {str(e)}")
