



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
