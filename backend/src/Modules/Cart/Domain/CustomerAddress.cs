using MixPlus.BuildingBlocks.Domain;

namespace MixPlus.Modules.Cart.Domain;

public sealed class CustomerAddress : AggregateRoot
{
    private CustomerAddress()
    {
    }

    public Guid UserId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string ReceiverName { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string Province { get; private set; } = string.Empty;
    public string City { get; private set; } = string.Empty;
    public string PostalCode { get; private set; } = string.Empty;
    public string AddressLine { get; private set; } = string.Empty;
    public bool IsDefault { get; private set; }

    public static CustomerAddress Create(
        Guid userId,
        string title,
        string receiverName,
        string phone,
        string province,
        string city,
        string postalCode,
        string addressLine,
        bool isDefault)
    {
        return new CustomerAddress
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title.Trim(),
            ReceiverName = receiverName.Trim(),
            Phone = phone.Trim(),
            Province = province.Trim(),
            City = city.Trim(),
            PostalCode = postalCode.Trim(),
            AddressLine = addressLine.Trim(),
            IsDefault = isDefault,
        };
    }

    public void Update(
        string title,
        string receiverName,
        string phone,
        string province,
        string city,
        string postalCode,
        string addressLine,
        bool isDefault)
    {
        Title = title.Trim();
        ReceiverName = receiverName.Trim();
        Phone = phone.Trim();
        Province = province.Trim();
        City = city.Trim();
        PostalCode = postalCode.Trim();
        AddressLine = addressLine.Trim();
        IsDefault = isDefault;
    }

    public void SetDefault(bool isDefault) => IsDefault = isDefault;
}
