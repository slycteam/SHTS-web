from datetime import datetime
import subprocess as sub
import re
import sqlite3
import requests

# TODO pip install ipwhois
from ipwhois import IPWhois


# TODO config info
SNOOZE_INTERVAL = 1 * 60 * 60 # 1 hour in seconds
DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'

re_srcMAC = re.compile("[0-9a-f:]{17}(?=\s>)")
re_dstIP = re.compile("(?<=(>\s))[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}.[0-9]{1,3}")

whitelist_MAC = set() # src MAC to ignore
whitelist_IP = set() # dst IP to ignore
confirmed_List = {} # {mac : set(IPs}
alerted_List = {} # {mac+IP : alertedTime}
alerted_IP = set()

# load whitelist from DB(sqlite)
conn = sqlite3.connect("db/sqlite/db.sqlite")
with conn:
    cur = conn.cursor()
    cur.execute("select MAC from whitelist_MACs")
    rows = cur.fetchall()
    for row in rows:
        whitelist_MAC.add(str(row[0]))

    cur.execute("select IP from whitelist_IPs")
    rows = cur.fetchall()
    for row in rows:
        whitelist_IP.add(str(row[0]))

    cur.execute("select MAC, IP from allowed_traffics order by MAC")
    rows = cur.fetchall()
    for row in rows:
        if str(row[0]) in confirmed_List.keys():
            confirmed_List[str(row[0])].add(str(row[1]))
        else:
            confirmed_List[str(row[0])] = set([str(row[1])])

# print(whitelist_MAC)
# print(whitelist_IP)
# print(confirmed_List)


def get_manuf(mac):
    mac = str.upper(mac)
    msg = {'MAC':mac}
    with conn:
        cur = conn.cursor()
        cur.execute("select detail_name from OUIs where manf_code = ?", (mac[:8],))
        row = cur.fetchone()
        if row :
            msg['vendor'] = row[0]
        else:
            msg['vendor'] = 'unkown vendor'
    # print(msg)
    return msg

def get_whois(ip):
    msg = {'IP':ip}
    try:
        r = IPWhois(ip).lookup_whois()
        for n in r['nets']:
            msg['name'] = n['description']
            msg['country'] = n['country']
            msg['address'] = n['address']
            break
    except:
        msg['name'] = 'unkown host!!!!!'
    # print(msg)
    return msg


def need_alert(srcMAC, dstIP):
    # print(datetime.datetime.now(), srcMAC, dstIP)
    if dstIP in alerted_IP : return False
    alerted_IP.add(dstIP)

    if srcMAC in confirmed_List.keys() :
        if dstIP in confirmed_List[srcMAC] : return False
    mac_ip = srcMAC + ' ' + dstIP
    if mac_ip in alerted_List.keys() :
        dt = datetime.now() - datetime.strptime(alerted_List[mac_ip],DATETIME_FORMAT)
        if SNOOZE_INTERVAL > dt.seconds : return False
    return True

def notification(srcMAC, dstIP):
    alerted_List[srcMAC+' '+dstIP] = datetime.now().strftime(DATETIME_FORMAT)
    # TODO  notification function implement
    #get_manuf(srcMAC)
    #get_whois(dstIP)
    dstInfo = get_whois(dstIP)
    msg = 'Alert!\n'\
            + '목적지정보:' + dstIP\
            + '\n이름:' + dstInfo['name']\
            + '\n국가:' + dstInfo['country']\
            + '\n주소:' + dstInfo['address']\
            + '\n\n등록하기:http://172.16.10.5/api/reg?ip=' + dstIP + '\n'

    
    # with conn:
    #     cur = conn.cursor()
    #     sql = '''INSERT INTO whitelist_IPs VALUES (?,?,datetime('now'),datetime('now'),null);'''
    #     cur.execute(sql, (dstIP,dstInfo['name']))
    #     conn.commit()
    #     cur.close()

    #print(msg)
    r = requests.post("http://172.16.10.5/api/channels/send",data={'text': msg})



# excute tcpdump and console read
ingnoreMACs = 'and ether src not ('+' and '.join(whitelist_MAC)+')' if (whitelist_MAC) else ''
ingnoreIPs = 'and dst host not ('+' and '.join(whitelist_IP)+')' if (whitelist_IP) else ''
p = sub.Popen(
    [ 'sudo','tcpdump'
        , 'ip' #IPv4 only
        , 'and not broadcast' #exclude broadcast traffic
        , 'and not multicast' #exclude multicast traffic
        , 'and dst net not 10.0.0.0/8'  #exclude local network traffic
        , 'and dst net not 172.16.0.0/12'  #exclude local network traffic
        , 'and dst net not 192.168.0.0/16'  #exclude local network traffic
        , 'and dst net not 127.0.0.0/8'  #exclude local network traffic
        , ingnoreMACs
        , ingnoreIPs
        , 'and ether host not b8:27:eb:5b:52:70' #pi eth0
        , 'and ether host not b8:27:eb:0e:07:25' #pi wlan0
        , '-letnq'
        #, '-c 10000' #for test
        #, '-i wlan0'
    ]
    , stdout=sub.PIPE
)

for row in iter(p.stdout.readline, b''):
    r = row.rstrip().decode('utf-8')
    srcMAC = re.search(re_srcMAC, r).group(0)
    dstIP = re.search(re_dstIP, r).group(0)
    if need_alert(srcMAC,dstIP) :
        notification(srcMAC,dstIP)
