function removeAds() {
    const adSelectors = [
        "#player-ads",
        ".ytp-ad-module"
    ];

    adSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(ad => {
            ad.style.display = "none";
        });
    });
}
