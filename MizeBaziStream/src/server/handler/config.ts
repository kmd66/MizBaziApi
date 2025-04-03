import os from 'os';

interface NetworkInterfaceInfo {
    address: string;
    netmask: string;
    family: string;
    mac: string;
    internal: boolean;
    scopeid?: number;
    cidr?: string;
}

interface MediaCodec {
    kind: 'audio' | 'video';
    mimeType: string;
    clockRate: number;
    channels?: number;
    parameters?: {
        [key: string]: any;
    };
}

interface ListenIp {
    ip: string;
    announcedIp: string;
}

interface WebRtcTransportOptions {
    listenIps: ListenIp[];
    enableUdp: boolean;
    enableTcp: boolean;
    preferUdp: boolean;
}

interface ConfigModel {
    apiKey: string;
    numWorkers: number;
    listenPort: number;
    rtcMinPort: number;
    rtcMaxPort: number;
    sslCrt: string;
    sslKey: string;
    webRtcTransport_options: WebRtcTransportOptions;
    mediaCodecs: MediaCodec[];
}

const ifaces = os.networkInterfaces();

const getLocalIp = (): string => {
    let localIp = '127.0.0.1';
    for (const ifname in ifaces) {
        const ifaceList = ifaces[ifname];
        if (!ifaceList) continue;

        for (const iface of ifaceList) {
            // Ignore IPv6 and 127.0.0.1
            if (iface.family !== 'IPv4' || iface.internal !== false) {
                continue;
            }
            // Set the local ip to the first IPv4 address found and exit the loop
            return iface.address;
        }
    }
    return localIp;
};


const mediaCodecs: MediaCodec[] = [
    {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
            'x-google-start-bitrate': 1000,
        },
    },
];

const webRtcTransport_options: WebRtcTransportOptions = {
    listenIps: [
        {
            ip: '0.0.0.0',
            announcedIp: getLocalIp(),
        }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
};

const model: ConfigModel = {
    apiKey: '123a5Mdmdsaui124d8a01220sa8w60123e56',
    numWorkers: Object.keys(os.cpus()).length,
    listenPort: 3000,
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    sslCrt: '/ssl/cert.pem',
    sslKey: '/ssl/key.pem',
    webRtcTransport_options: webRtcTransport_options,
    mediaCodecs: mediaCodecs,
};

export default model;