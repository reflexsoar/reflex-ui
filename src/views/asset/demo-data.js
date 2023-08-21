export const assets = [
    {
        id: 2,
        asset_type: 'computer',
        computer: {
            name: 'REFLEX-SRV-0001',
            fqdn: 'REFLEX-SRV-0001.ad.reflexcyber.com',
            domain: 'ad.reflexcyber.com',
            interface: [
                {
                    name: 'Ethernet',
                    mac: '00:00:00:00:00:00',
                    ip: '10.100.100.123',
                    subnet: '10.100.100.0/24',
                    gateway: '10.100.100.1',
                    dns: [
                        '10.100.100.2',
                        '10.200.100.2'
                    ],
                    dhcp: false,
                    enabled: true
                }
            ],
            mac: [
                '00:00:00:00:00:00'
            ],
            ip: [
                '10.100.100.123'
            ],
            distinguished_name: 'CN=REFLEX-SRV-0001,OU=Servers,OU=Reflex Cyber,DC=ad,DC=reflexcyber,DC=com',
            enabled: true,
            last_logon: '2020-01-01T00:00:00.000Z',
            last_reboot: '2020-01-01T00:00:00.000Z',
            last_logon_user: 'brian-adm',
            owner: 'SYSTEM',
            sid: 'S-1-5-21-1234567890-1234567890-1234567890-1234',
            serial_number: '1234567890',
            form_factor: 'server',
            os: {
                name: 'Windows Server 2019 Standard',
                version: '10.0.17763',
                build: '17763',
                service_pack: '',
                arch: 'x64',
                language: 'English (United States)'
            }
        }
    },
    {
        id: 2,
        asset_type: 'computer',
        computer: {
            name: 'REFLEX-PC-0001',
            fqdn: 'REFLEX-PC-0001.ad.reflexcyber.com',
            domain: 'ad.reflexcyber.com',
            interface: [
                {
                    name: 'GlobalProtect VPN',
                    mac: '00:00:00:00:00:00',
                    ip: '10.220.100.123',
                    subnet: '10.220.100.0/24',
                    gateway: '10.220.100.1',
                    dns: [
                        '10.100.100.2',
                        '10.200.100.2'
                    ],
                    dhcp: true,
                    enabled: false
                },
                {
                    name: 'Ethernet 1',
                    mac: '00:00:00:00:00:00',
                    ip: '192.168.10.100',
                    subnet: '192.168.10.0/24',
                    gateway: '192.168.10.1',
                    dns: [
                        '192.168.10.1',
                        '8.8.8.8'
                    ],
                    dhcp: true,
                    enabled: false
                }
            ],
            mac: [
                '00:00:00:00:00:00',
                '00:00:00:00:00:01'
            ],
            ip: [
                '10.220.100.123',
                '127.0.0.1',
                '192.168.10.100'
            ],
            distinguished_name: 'CN=REFLEX-PC-0001,OU=Computers,OU=Reflex Cyber,DC=ad,DC=reflexcyber,DC=com',
            enabled: true,
            last_logon: '2020-01-01T00:00:00.000Z',
            last_reboot: '2020-01-01T00:00:00.000Z',
            last_logon_user: 'brian',
            owner: 'brian',
            sid: 'S-1-5-21-1234567890-1234567890-1234567890-1234',
            serial_number: '1234567890',
            form_factor: 'laptop',
            os: {
                name: 'Windows 10 Pro',
                version: '10.0.18363',
                build: '18363',
                service_pack: '',
                arch: 'x64',
                language: 'English (United States)'
            }
        }
    },
    {
        id: 3,
        asset_type: 'user',
        user: {
            name: 'Brian Carroll',
            user_principal_name: 'brian@reflexcyber.com',
            first_name: 'Brian',
            last_name: 'Carroll',
            email: 'brian@reflexcyber.com',
            phone: '123-456-7890',
            mobile: '123-456-7890',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '12345',
            title: 'Chief Technology Officer',
            department: 'Leadership',
            location: 'Remote',
            locked: false,
            enabled: true,
            last_logon: '2020-01-01T00:00:00.000Z',
            user_type: 'domain',
            domain: 'ad.reflexcyber.com',
            sid: 'S-1-5-21-1234567890-1234567890-1234567890-1234',
            distinguished_name: 'CN=Brian Carroll,OU=Users,OU=Reflex Cyber,DC=ad,DC=reflexcyber,DC=com',
        }
    }
]

