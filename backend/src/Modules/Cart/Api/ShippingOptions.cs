namespace MixPlus.Modules.Cart.Api;

internal static class ShippingOptions
{
    public sealed record Option(
        string Id,
        string Title,
        string Description,
        decimal Cost,
        int MinDays,
        int MaxDays,
        string Kind);

    public sealed record PickupBranch(string Id, string Title, string Address, string Hours);

    public static IReadOnlyList<Option> ForCity(string? city)
    {
        var isTehran = string.Equals(city?.Trim(), "تهران", StringComparison.OrdinalIgnoreCase);
        return
        [
            new Option(
                "express",
                "ارسال اکسپرس",
                isTehran ? "تحویل امروز / فردا" : "۱ تا ۳ روز کاری",
                isTehran ? 89_000m : 149_000m,
                isTehran ? 0 : 1,
                isTehran ? 1 : 3,
                "delivery"),
            new Option(
                "standard",
                "پست پیشتاز",
                "۳ تا ۵ روز کاری",
                59_000m,
                3,
                5,
                "delivery"),
            new Option(
                "pickup",
                "تحویل حضوری از شعبه",
                "بدون هزینه ارسال — انتخاب شعبه الزامی است",
                0m,
                0,
                1,
                "pickup"),
        ];
    }

    public static IReadOnlyList<PickupBranch> Branches { get; } =
    [
        new("br-vanak", "شعبه ونک", "تهران، میدان ونک، خیابان گاندی", "۹ تا ۲۱"),
        new("br-saadat", "شعبه سعادت‌آباد", "تهران، سعادت‌آباد، میدان کاج", "۱۰ تا ۲۲"),
        new("br-shiraz", "شعبه شیراز", "شیراز، خیابان زند", "۹ تا ۲۰"),
    ];

    public static Option? Find(string? id, string? city) =>
        ForCity(city).FirstOrDefault(x =>
            string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));

    public static PickupBranch? FindBranch(string? id) =>
        Branches.FirstOrDefault(x =>
            string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
}
