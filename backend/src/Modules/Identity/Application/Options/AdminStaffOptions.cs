namespace MixPlus.Modules.Identity.Application.Options;

/// <summary>
/// Phone numbers allowed into the admin console after OTP — bound from <c>Admin:Staff</c>.
/// </summary>
public sealed class AdminStaffOptions
{
    public const string SectionName = "Admin:Staff";

    public List<AdminStaffMemberOptions> Members { get; set; } = [];
}

public sealed class AdminStaffMemberOptions
{
    /// <summary>Iran mobile, e.g. 0912xxxxxxx.</summary>
    public string Phone { get; set; } = string.Empty;

    /// <summary>super_admin | catalog_manager | ops_manager | support</summary>
    public string Role { get; set; } = "super_admin";

    public string? DisplayName { get; set; }
}
