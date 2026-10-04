namespace MixPlus.BuildingBlocks.Application;

public class Result
{
    protected Result(bool isSuccess, string? error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string? Error { get; }

    public static Result Success() => new(true, null);

    public static Result Failure(string error) => new(false, error);

    public static Result<T> Success<T>(T value) => Result<T>.Success(value);

    public static Result<T> Failure<T>(string error) => Result<T>.Failure(error);
}

public sealed class Result<T> : Result
{
    private readonly T? _value;

    private Result(T? value, bool isSuccess, string? error)
        : base(isSuccess, error)
    {
        _value = value;
    }

    public T Value =>
        IsSuccess
            ? _value!
            : throw new InvalidOperationException("Cannot read Value from a failed result.");

    public static Result<T> Success(T value) => new(value, true, null);

    public new static Result<T> Failure(string error) => new(default, false, error);
}
