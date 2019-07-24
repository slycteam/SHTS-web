from datetime import datetime
import subprocess as sub
import re
import sqlite3

# TODO config info
SNOOZE_INTERVAL = 1 * 60 * 60 # 1 hour in seconds
DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'

re_srcMAC = re.compile("[0-9a-f:]{17}(?=\s>)")
re_dstIP = re.compile("(?<=(>\s))[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}.[0-9]{1,3}")

whitelist_MAC = set() # src MAC to ignore
whitelist_IP = set() # dst IP to ignore
confirmed_List = {} # {mac : set(IPs}
alerted_List = {} # {mac+IP : alertedTime}


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
        print(row)
        if str(row[0]) in confirmed_List.keys():
            confirmed_List[str(row[0])].add(str(row[1]))
        else:
            confirmed_List[str(row[0])] = set([str(row[1])])
        
# print(whitelist_MAC)
# print(whitelist_IP)
# print(confirmed_List)

# alerted_List = {'88:e9:fe:63:be:00 216.58.200.67':'2019-07-22 00:00:00'}


def need_alert(srcMAC, dstIP):
    # print(datetime.datetime.now(), srcMAC, dstIP)
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
    print('Alert!',srcMAC, dstIP)


# excute tcpdump and console read
ingnoreMACs = 'and ether src not ('+' and '.join(whitelist_MAC)+')' if (whitelist_MAC) else ''
ingnoreIPs = 'and dst host not ('+' and '.join(whitelist_IP)+')' if (whitelist_IP) else ''
p = sub.Popen(
    ['sudo'
        , 'tcpdump'
        , '-letnq'
        , 'not broadcast' 
        , 'and ip' #IPv4 only
        , 'and dst net not 224.0.0.0/24'  #exclude multicast traffic
        , 'and dst net not 10.0.0.0/8'  #exclude local network traffic
        , 'and dst net not 172.16.0.0/12'  #exclude local network traffic
        , 'and dst net not 192.168.0.0/16'  #exclude local network traffic
        , 'and dst net not 127.0.0.0/8'  #exclude local network traffic
        #, 'and dst net not (10.0.0.0/8 and 172.16.0.0/12 and 192.168.0.0/16 and 127.0.0.0/8 )'  #exclude local network traffic
        , ingnoreMACs
        , ingnoreIPs
        , '-c 1000' #for test
        , 'and ether src 88:e9:fe:63:be:00' #for test
    ]
    , stdout=sub.PIPE
)

for row in iter(p.stdout.readline, b''):
    r = row.rstrip().decode('utf-8')
    srcMAC = re.search(re_srcMAC, r).group(0)
    dstIP = re.search(re_dstIP, r).group(0)
    if need_alert(srcMAC,dstIP) : 
        notification(srcMAC,dstIP)
