function FindProxyForURL(url, host) {
    PROXY = "PROXY 127.0.0.1:8989"

    // rebeltech only via proxy
    if (shExpMatch(host,"*.rebeltech.org")) {
        return PROXY;
    }
    // Everything else directly!
    return "DIRECT";
}