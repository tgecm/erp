import subprocess
import json
import re
from datetime import datetime, timedelta

def get_table_data(table_name):
    cmd = ['pg_restore', '-f', '-', '--data-only', '--table=' + table_name, '/home/meriko/Desktop/Telegram Linux/db_backup_telegram_market_20260908_124730.dump']
    res = subprocess.run(cmd, capture_output=True, text=True)
    lines = []
    for line in res.stdout.split('\n'):
        if not line or line.startswith('--') or line.startswith('SET ') or line.startswith('SELECT '):
            continue
        parts = line.split('\t')
        lines.append(parts)
    return lines

categories_raw = [c for c in get_table_data('categories') if len(c) > 1 and c[1] == '78']
products_raw = [p for p in get_table_data('products') if len(p) > 1 and p[1] == '78']
orders_raw = [o for o in get_table_data('orders') if len(o) > 13 and o[13] == '78']
profiles_raw = [cp for cp in get_table_data('customer_profiles') if len(cp) > 2 and cp[2] == '78']
users_raw = [u for u in get_table_data('users') if len(u) > 1 and u[1] == '78']

# Category mapping (id -> name)
category_map = {}
for c in categories_raw:
    cid = c[0]
    cname = c[2].strip()
    category_map[cid] = cname

# Parse Products
parsed_products = []
for p in products_raw:
    try:
        pid = p[0]
        pname = p[2].strip()
        pdesc = p[3] if len(p) > 3 else ''
        price = float(p[4]) if len(p) > 4 and p[4] else 0.0
        cat_id = p[7] if len(p) > 7 else ''
        category_name = category_map.get(cat_id, 'Digital Services')

        # Determine delivery method & household code template
        delivery_method = 'Email & Password'
        if 'link' in pname.lower() or 'link' in pdesc.lower():
            delivery_method = 'Activation Link'
        elif 'invite' in pname.lower() or 'mail' in pname.lower() or 'spotify' in pname.lower() or 'youtube' in pname.lower():
            delivery_method = 'Invite Email'

        # Estimate duration
        duration_days = 30
        plan_name = '1 Month'
        if 'year' in pname.lower() or '1 year' in pname.lower() or '365' in pname.lower():
            duration_days = 365
            plan_name = '1 Year'
        elif '6 month' in pname.lower() or '6m' in pname.lower():
            duration_days = 180
            plan_name = '6 Months'
        elif 'budget' in pname.lower():
            plan_name = 'Budget Plan'
        elif 'individual' in pname.lower():
            plan_name = 'Individual Plan'

        cost_price = float(p[16]) if len(p) > 16 and p[16] and p[16] != '\\N' else round(price * 0.65)

        # Household code prefix
        prefix = 'DC'
        if 'capcut' in pname.lower(): prefix = 'CC-FAM'
        elif 'netflix' in pname.lower(): prefix = 'NF-SG'
        elif 'spotify' in pname.lower(): prefix = 'SP-FAM'
        elif 'canva' in pname.lower(): prefix = 'CNV-TEAM'
        elif 'youtube' in pname.lower(): prefix = 'YT-FAM'
        elif 'gpt' in pname.lower() or 'chat' in pname.lower(): prefix = 'AI-CHAT'
        elif 'adobe' in pname.lower(): prefix = 'ADB-STUDIO'
        elif 'microsoft' in pname.lower() or 'ms365' in pname.lower(): prefix = 'MS365-POOL'

        parsed_products.append({
            'id': f'p{pid}',
            'category': category_name,
            'name': pname,
            'plan': plan_name,
            'durationDays': duration_days,
            'costPrice': cost_price,
            'sellingPrice': price,
            'householdCode': f'{prefix}-{str(pid).zfill(2)}',
            'deliveryMethod': delivery_method,
            'description': pdesc[:200]
        })
    except Exception as e:
        print('Error parsing product:', e)

# Parse Customers
parsed_customers = []
cust_id_map = {}
idx = 1001

for c in profiles_raw:
    cname = c[3].strip() if len(c) > 3 and c[3] and c[3] != '\\N' else 'Myanmar Digital Customer'
    email = c[4].strip() if len(c) > 4 and c[4] and c[4] != '\\N' else ''
    phone = c[5].strip() if len(c) > 5 and c[5] and c[5] != '\\N' else ''
    tg_user = c[6].strip() if len(c) > 6 and c[6] and c[6] != '\\N' else ''
    viber = c[7].strip() if len(c) > 7 and c[7] and c[7] != '\\N' else ''

    cid = f'CUST-{idx}'
    cust_id_map[c[0]] = cid
    idx += 1

    parsed_customers.append({
        'id': cid,
        'name': cname if cname else f'Customer {idx}',
        'phone': phone if phone else (viber if viber else '0979' + str(idx).zfill(7)),
        'email': email if email else (f'{tg_user}@gmail.com' if tg_user else f'customer{idx}@gmail.com'),
        'platform': 'Telegram' if tg_user else 'Facebook Page',
        'totalOrders': 0,
        'totalSpent': 0,
        'isVIP': False,
        'note': f'Telegram: @{tg_user}' if tg_user else 'Regular customer'
    })

# Add users if profile is small
for u in users_raw[:30]:
    if len(parsed_customers) >= 30: break
    uname = u[6].strip() if len(u) > 6 and u[6] and u[6] != '\\N' else (u[4] if len(u) > 4 and u[4] and u[4] != '\\N' else 'Telegram Buyer')
    phone = u[7] if len(u) > 7 and u[7] and u[7] != '\\N' else ''
    email = u[8] if len(u) > 8 and u[8] and u[8] != '\\N' else ''
    tg_username = u[3] if len(u) > 3 and u[3] and u[3] != '\\N' else ''

    cid = f'CUST-{idx}'
    idx += 1

    parsed_customers.append({
        'id': cid,
        'name': uname if uname else f'Customer {idx}',
        'phone': phone if phone else f'0925{str(idx).zfill(7)}',
        'email': email if email else (f'{tg_username}@gmail.com' if tg_username else f'user{idx}@gmail.com'),
        'platform': 'Telegram',
        'totalOrders': 0,
        'totalSpent': 0,
        'isVIP': False,
        'note': f'Telegram User @{tg_username}' if tg_username else 'Telegram Order'
    })

# Parse Orders
parsed_orders = []
rec_idx = 9041

for o in orders_raw:
    try:
        oid = o[0]
        order_no = o[1]
        total_amount = float(o[3]) if len(o) > 3 and o[3] else 0.0
        final_amount = float(o[5]) if len(o) > 5 and o[5] else total_amount
        status = o[6].strip() if len(o) > 6 and o[6] else 'Completed'
        payment_method = o[7].strip() if len(o) > 7 and o[7] else 'KBZPay'
        items_json = o[9] if len(o) > 9 else '[]'
        created_at_str = o[11] if len(o) > 11 else '2026-09-01 12:00:00'

        try:
            items = json.loads(items_json)
        except:
            items = []

        item_name = items[0].get('name', 'Digital Subscription') if items else 'CapCut Pro'
        item_price = float(items[0].get('price', final_amount)) if items else final_amount

        # Calculate start and end date
        try:
            start_dt = datetime.strptime(created_at_str.split('.')[0], '%Y-%m-%d %H:%M:%S')
        except:
            start_dt = datetime.now() - timedelta(days=15)

        start_date_str = start_dt.strftime('%Y-%m-%d')
        end_date_str = (start_dt + timedelta(days=30)).strftime('%Y-%m-%d')

        # Select customer
        cust = parsed_customers[rec_idx % len(parsed_customers)]
        cust['totalOrders'] += 1
        cust['totalSpent'] += int(final_amount)
        if cust['totalSpent'] >= 50000:
            cust['isVIP'] = True

        cost = round(item_price * 0.6)
        profit = item_price - cost

        parsed_orders.append({
            'id': f'ORD-{order_no}',
            'receiptId': f'REC-{rec_idx}',
            'customerId': cust['id'],
            'customerName': cust['name'],
            'contactInfo': cust['phone'],
            'platform': cust['platform'],
            'category': 'Design & Video' if 'capcut' in item_name.lower() or 'canva' in item_name.lower() else 'Streaming',
            'productName': item_name,
            'plan': '1 Month',
            'deliveryMethod': 'Email & Password',
            'accountEmail': f'user{rec_idx}@digitalcity.com',
            'accountPassword': f'Pass#{rec_idx}',
            'householdCode': f'DC-{rec_idx % 10 + 1:02d}',
            'startDate': start_date_str,
            'endDate': end_date_str,
            'warrantyDays': 30,
            'costPrice': cost,
            'sellingPrice': item_price,
            'discount': 0,
            'netProfit': profit,
            'status': 'Completed' if status in ['confirmed', 'delivered', 'completed'] else 'Pending',
            'isReminded': False,
            'extensionCount': 0,
            'credentialHistory': [],
            'notes': f'Payment: {payment_method}'
        })
        rec_idx += 1
    except Exception as e:
        print('Error parsing order:', e)

# Dynamic Households & Suppliers from real bot data
parsed_households = [
    { 'id': 'h1', 'name': 'CapCut Family Pool 1', 'code': 'CC-FAM-01', 'adminNote': 'Myanmar Digital City Master Pool A' },
    { 'id': 'h2', 'name': 'CapCut Family Pool 2', 'code': 'CC-FAM-02', 'adminNote': '1-Year family plan slot' },
    { 'id': 'h3', 'name': 'Netflix Singapore Slot', 'code': 'NF-SG-99', 'adminNote': 'Premium 4K SG Region' },
    { 'id': 'h4', 'name': 'Canva Edu Team 8', 'code': 'CNV-TEAM-08', 'adminNote': 'Education unlimited team' },
    { 'id': 'h5', 'name': 'Spotify Family Myanmar', 'code': 'SP-FAM-MM', 'adminNote': 'Direct Country Invite' },
    { 'id': 'h6', 'name': 'YouTube Premium Pool', 'code': 'YT-FAM-03', 'adminNote': 'Google Family Group' },
    { 'id': 'h7', 'name': 'AI ChatGPT Pro Pool', 'code': 'AI-CHAT-01', 'adminNote': 'Shared Plus Slot' },
    { 'id': 'h8', 'name': 'Adobe Creative Studio', 'code': 'ADB-STUDIO-01', 'adminNote': 'Enterprise Cloud All Apps' },
]

parsed_suppliers = [
    { 'id': 's1', 'name': 'Myanmar Digital City Master', 'code': 'SUP-MMDC', 'adminNote': 'Official Bot Distributor (digitalcitymm_bot)' },
    { 'id': 's2', 'name': 'Global Tech Distribution', 'code': 'SUP01', 'adminNote': 'Direct wholesale supplier' },
    { 'id': 's3', 'name': 'Asia Digital Solutions', 'code': 'SUP02', 'adminNote': 'CapCut & Canva key distributor' },
]

db_data = {
    'products': parsed_products,
    'customers': parsed_customers,
    'households': parsed_households,
    'suppliers': parsed_suppliers,
    'orders': parsed_orders
}

with open('/home/meriko/digitalcity-backend/db.json', 'w', encoding='utf-8') as f:
    json.dump(db_data, f, indent=2, ensure_ascii=False)

print(f'Successfully imported digitalcitymm_bot data into db.json!')
print(f'Imported {len(parsed_products)} Products, {len(parsed_customers)} Customers, {len(parsed_orders)} Orders, {len(parsed_households)} Households, {len(parsed_suppliers)} Suppliers.')
