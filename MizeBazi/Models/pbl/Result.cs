namespace MizeBazi.Models;

public class Result
{
    public override string ToString()
        => $"{Success}{(string.IsNullOrWhiteSpace(Message) ? string.Empty : $": {Message}")}";

    public bool Success { get; set; }

    public bool OK => Success;

    public int Code { get; set; }


    private List<string> _errors { get; set; }

    public string Message
    {
        get => _errors == null || _errors.Count == 0 ? null : _errors.Count > 1? string.Join("\n", _errors): _errors.FirstOrDefault();
        set
        {
            if (_errors == null)
                _errors = new List<string>();
            if (!string.IsNullOrEmpty(value))
            {
                _errors.Add(value);

                _errors = _errors.Distinct().ToList();
            }
        }
    }

    public List<string> Errors
    {
        get => _errors.Distinct().ToList();
        set
        {
            _errors = value;
        }
    }

    public static Result Set(bool success, int code = 0, string message = "")
        => new Result { Success = success, Code = code, Message = message };

    public static Task<Result> SetAsync(bool success, int code = 0, string message = "")
        => Task.FromResult(new Result { Success = success, Code = code, Message = message });

    public static Result Failure(int code = -1, string message = "")
        => new Result { Success = false, Code = code, Message = message };

    public static Result Failure(int code = -1, List<string> errors = null)
        => new Result { Success = false, Code = code, Errors = errors };

    public static Task<Result> FailureAsync(int code = -1, string message = "")
        => Task.FromResult(new Result { Success = false, Code = code, Message = message });

    public static Task<Result> FailureAsync(int code = -1, List<string> errors = null)
        => Task.FromResult(new Result { Success = false, Code = code, Errors = errors });

    public static Result Successful(int code = 0, string message = "")
        => new Result { Success = true, Code = code, Message = message };

    public static Task<Result> SuccessfulAsync(int code = 0, string message = "")
        => Task.FromResult(new Result { Success = true, Code = code, Message = message });

    protected object _data;

    public object GetData() => _data;

}

public class Result<T> : Result
{
    public int TotalCount { get; set; }

    public T Data
    {
        get { return (T)_data; }
        set { _data = value; }
    }

    public static Result<T> Set(bool success, int code = 0, string message = "", T data = default(T), int totalCount = 0)
        => new Result<T> { Success = success, Code = code, Message = message, Data = data, TotalCount = totalCount };

    public static Task<Result<T>> SetAsync(bool success, int code = 0, string message = "", T data = default(T))
        => Task.FromResult(new Result<T> { Success = success, Code = code, Message = message, Data = data, TotalCount = 0 });

    public static Result<T> Failure(int code = -1, string message = "", T data = default(T))
        => new Result<T> { Success = false, Code = code, Message = message, Data = data, TotalCount = 0 };

    public static Result<T> Failure(int code = -1, List<string> errors = null, T data = default(T))
        => new Result<T> { Success = false, Code = code, Errors = errors, Data = data, TotalCount = 0 };

    public static Task<Result<T>> FailureAsync(int code = -1, string message = "", T data = default(T))
        => Task.FromResult(new Result<T> { Success = false, Code = code, Message = message, Data = data, TotalCount = 0 });

    public static Task<Result<T>> FailureAsync(int code = -1, List<string> errors = null, T data = default(T))
        => Task.FromResult(new Result<T> { Success = false, Code = code, Errors = errors, Data = data, TotalCount = 0 });

    public static Result<T> Successful(int code = 0, string message = "", T data = default(T))
        => new Result<T> { Success = true, Code = code, Message = message, Data = data, TotalCount = 0 };

    public static Task<Result<T>> SuccessfulAsync(int code = 0, string message = "", T data = default(T))
        => Task.FromResult(new Result<T> { Success = true, Code = code, Message = message, Data = data, TotalCount = 0 });
}
