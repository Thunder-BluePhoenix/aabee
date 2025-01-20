
import frappe
import requests
import json
import requests
import os

@frappe.whitelist()
def initiate_full_process():
   
    user_id = "1234_33334993"
    password = "123456"
    app_id = 33334993
    app_secret = "b6cadca2-f98f-4f2e-bef9-883656825298"
    to_number = 917559302314
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




# @frappe.whitelist()
# def get_telecmi_settings():
#     user_id = "1234_33334993"
#     password = "123456"
#     display_name = "Test"
#     uri = "sbcind.telecmi.com"
#     return {
#         'user_id': user_id,
#         'password': password,
#         'sbc_uri': uri,
#         'display_name': display_name
#     }





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



# @frappe.whitelist(allow_guest=True)
# def incoming():
#     # try:
#     data = frappe.request.get_json()
#     if not data:
#         return {"code": 400, "message": "Invalid or missing payload"}

#     from_number = data.get("from")
#     to_number = data.get("to")
#     cmiuuid = data.get("cmiuuid")
#     appid = data.get("appid")

#     to = to_number

#     if from_number :
#         if frappe.get_doc("Customer", {"custom_primary_mobile_no": from_number}) :
#             customer = frappe.get_doc("Customer", {"custom_primary_mobile_no": from_number})
#             if customer:
#                 assign = customer.custom_assign_to
#                 if assign:
#                     employee = frappe.get_doc("Employee", {"name": assign})
#                     if employee:
#                         telecmi_id = employee.custom_telecmi_id
#                         telecmi_password = employee.custom_telecmi_password
#                         followme = employee.custom_follow_me_
#                         agent_number = employee.custom_telecmi_mobile_number
#                 else:
#                     telecmi_id = "1234_33334993"
#                     telecmi_password = "123456"
#                     followme = True
#                     agent_number = "918670972005"
#         else:
#             telecmi_id = "1234_33334993"
#             telecmi_password = "123456"
#             followme = True
#             agent_number = "918670972005"
#     else:
#             telecmi_id = "1234_33334993"
#             telecmi_password = "123456"
#             followme = True
#             agent_number = "918670972005"




#     response_body = {
#         "code": 200,
#         "loop": 2,
#         "followme": True if 1 else False,
#         "hangup": False,
#         "timeout": 20,
#         "welcome_music": "1609133greeting_music.wav",
#         "waiting_music": "16098620waiting_music.wav",
#         "result": [
#             {
#                 "agent_id": telecmi_id,
#                 "phone": agent_number,
#             }
#         ]
#     }
#     return response_body

    # except Exception as e:
    #     frappe.log_error(frappe.get_traceback(), "TeleCMI Process Call Flow")
    #     return {"code": 500, "message": str(e)}



# @frappe.whitelist(allow_guest=True)
# def incoming():
#     # Parse the incoming request data
#     data = frappe.request.get_json()
#     if not data:
#         return {"code": 400, "message": "Invalid or missing payload"}

#     from_number = data.get("from")
#     to_number = data.get("to")
#     cmiuuid = data.get("cmiuuid")
#     appid = data.get("appid")

#     telecmi_id = "1234_33334993"
#     telecmi_password = "123456"
#     followme = True
#     agent_number = "918670972005"  # Default values

#     if from_number:
#         # Check if a Customer with the given mobile number exists
#         customer_name = frappe.db.get_value("Customer", {"custom_primary_mobile_no": from_number}, "name")
#         if customer_name:
#             customer = frappe.get_doc("Customer", customer_name)
#             assign = customer.custom_assign_to
#             if assign:
#                 # Check if the assigned Employee exists
#                 employee_name = frappe.db.get_value("Employee", {"name": assign}, "name")
#                 if employee_name:
#                     employee = frappe.get_doc("Employee", employee_name)
#                     telecmi_id = employee.custom_telecmi_id
#                     telecmi_password = employee.custom_telecmi_password
#                     followme = employee.custom_follow_me_
#                     agent_number = employee.custom_telecmi_mobile_number

#     # Prepare the response
#     response_body = {
#         "code": 200,
#         "loop": 2,
#         "followme": followme,
#         "hangup": False,
#         "timeout": 20,
#         "welcome_music": "1609133greeting_music.wav",
#         "waiting_music": "16098620waiting_music.wav",
#         "result": [
#             {
#                 "agent_id": telecmi_id,
#                 "phone": agent_number,
#             }
#         ]
#     }
#     return response_body



@frappe.whitelist(allow_guest=True)
def incoming():
    try:
        # Get and validate JSON data
        data = frappe.request.get_json()
        if not data:
            return {"code": 400, "message": "Invalid or missing payload"}
        print(data)

        # Extract request parameters
        from_number = data.get("from")
        to_number = data.get("to")
        cmiuuid = data.get("cmiuuid")
        appid = data.get("appid")

        # Default values for telecmi configuration
        default_config = {
            "telecmi_id": "1234_33334993",
            "telecmi_password": "123456",
            "followme": True,
            "agent_number": "918670972005"
        }

        # Initialize telecmi configuration with defaults
        telecmi_config = default_config.copy()

        # Try to find customer and their assigned employee if from_number exists
        if from_number:
            try:
                customer = frappe.get_doc("Customer", {"custom_primary_mobile_no": from_number})
                if customer and customer.custom_assign_to:
                    employee = frappe.get_doc("Employee", {"name": customer.custom_assign_to})
                    if employee:
                        telecmi_config.update({
                            "telecmi_id": employee.custom_telecmi_id,
                            "telecmi_password": employee.custom_telecmi_password,
                            "followme": employee.custom_follow_me_,
                            "agent_number": employee.custom_telecmi_mobile_number
                        })
            except frappe.DoesNotExistError:
                # If customer not found, use default config (already set)
                pass

        # Prepare response
        response_body = {
            "code": 200,
            "loop": 2,
            "followme": True if telecmi_config["followme"] else False,
            "hangup": False,
            "timeout": 20,
            "welcome_music": "1609133greeting_music.wav",
            "waiting_music": "16098620waiting_music.wav",
            "result": [
                {
                    "agent_id": telecmi_config["telecmi_id"],
                    "phone": telecmi_config["agent_number"],
                }
            ]
        }
        print(response_body)
        return response_body

    except Exception as e:
        frappe.log_error(f"Telecmi Webhook Error: {str(e)}", "Telecmi Webhook")
        return {
            "code": 500,
            "message": "Internal server error",
            "error": str(e)
        }





# @frappe.whitelist(allow_guest=True)
# def call_records():
#     try:
#         data = frappe.request.get_json()
#         print(data)
#         print("77777777777777777777777777777777777777777777777777777778888")
#         return "got_it"

#     except Exception as e:
#         frappe.log_error(f"Telecmi Webhook Error: {str(e)}", "Telecmi Webhook")
#         return {
#             "code": 500,
#             "message": "Internal server error",
#             "error": str(e)
#         }


@frappe.whitelist(allow_guest=True)

def call_records():
    try:
      
        data = frappe.request.get_json()
        print(data)

        
        if not data.get('call_id') or not data.get('status'):
            return {
                "code": 400,
                "message": "Missing required fields in the payload"
            }

        call_log_data = frappe.get_doc({
            "doctype": "Call Log",  
            "from": str(data.get('virtual_number')),
            "id": data.get('call_id'),
            "type": "Outgoing",
            "to": str(data.get('to')),
            # "cmiuuid": data.get('cmiuuid'),
            # "status": data.get('status').capitalize() if data.get('status') else None,
            "status": "In Progress",
            # "user": data.get('user'),
            # "duration": data.get('time'),
            # "direction": data.get('direction'),
            "duration": data.get('answeredsec'),
            # "hangup_reason": data.get('hangup_reason'),
            # "request_id": data.get('request_id'),
            # "extra_params": frappe.as_json(data.get('extra_params')),  
        })
        
      

        if "filename" in data and data["filename"]:
            try:
                file_name = data["filename"]
                app_id = data["appid"]
                file_path = os.path.join(frappe.utils.get_site_path("public", "files"), file_name)

                remote_file_url = f"https://app.telecmi.com/download_music/{file_name}?inet_no={app_id}" 
                print(remote_file_url) 
                # call_log_data["recording_url"] = remote_file_url
                call_log_data.set("recording_url", remote_file_url)
                

                
                # response = requests.get(remote_file_url, stream=True)
                # if response.status_code == 200:
                #     with open(file_path, "wb") as file:
                #         for chunk in response.iter_content(chunk_size=8192):
                #             file.write(chunk)
                #     print(f"File downloaded successfully: {file_path}")
                # else:
                #     raise Exception(f"Failed to download file. HTTP Status Code: {response.status_code}")

                
                # file_doc = frappe.get_doc({
                #     "doctype": "File",
                #     "file_url": f"/files/{file_name}",  
                #     "attached_to_doctype": "Call Log",
                #     "attached_to_name": data.get('call_id'),
                # })
                # file_doc.insert(ignore_permissions=True)

                frappe.db.commit()
                print("File saved successfully")
                # print(f"File size: {os.path.getsize(file_path)}")
                # print(f"File URL created: {file_doc.file_url}")

                # call_log_data["custom_recording_file"] = file_doc.file_url
                # call_log_data.set("custom_recording_file", file_doc.file_url)
                print(f"Value set in call_log_data: {call_log_data.get('custom_recording_file')}")

            except Exception as e:
                frappe.log_error(f"Error saving file: {str(e)}", "Call Log File Save Error")
                print(f"Error saving file: {str(e)}")


        try:
            # print(f"Value before creating new doc: {call_log_data.get('custom_recording_file')}")
            call_log = frappe.get_doc(call_log_data)
            print(f"Value in new doc: {call_log.custom_recording_file}")
            # call_log.custom_recording_file = call_log_data.get("custom_recording_file") 
            call_log.insert(ignore_permissions=True)
            frappe.db.commit()
            print(f"Final saved value: {call_log.custom_recording_file}")
            print("Call record successfully logged")
        except Exception as e:
            frappe.log_error(f"Error saving call log: {str(e)}", "Call Log Save Error")
            print(f"Error saving call log: {str(e)}")


            return {
                    "code": 200,
                    "message": "Call record successfully logged"
                }

    except Exception as e:
        frappe.log_error(f"TeleCMI Webhook Error: {str(e)}", "TeleCMI Webhook")
        return {
            "code": 500,
            "message": "Internal server error",
            "error": str(e)
        }

