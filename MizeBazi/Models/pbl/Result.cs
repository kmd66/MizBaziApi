namespace MizeBazi.Models;

public class Result
{
    public override string ToString()
        => $"{success}{(string.IsNullOrWhiteSpace(message) ? string.Empty : $": {message}")}";

    public bool success { get; set; }

    public bool OK => success;

    public int code { get; set; }


    private List<string> _errors { get; set; }

    public string message
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
        => new Result { success = success, code = code, message = message };

    public static Task<Result> SetAsync(bool success, int code = 0, string message = "")
        => Task.FromResult(new Result { success = success, code = code, message = message });

    public static Result Failure(int code = -1, string message = "")
        => new Result { success = false, code = code, message = message };

    public static Result Failure(int code = -1, List<string> errors = null)
        => new Result { success = false, code = code, Errors = errors };

    public static Task<Result> FailureAsync(int code = -1, string message = "")
        => Task.FromResult(new Result { success = false, code = code, message = message });

    public static Task<Result> FailureAsync(int code = -1, List<string> errors = null)
        => Task.FromResult(new Result { success = false, code = code, Errors = errors });

    public static Result Successful(int code = 0, string message = "")
        => new Result { success = true, code = code, message = message };

    public static Task<Result> SuccessfulAsync(int code = 0, string message = "")
        => Task.FromResult(new Result { success = true, code = code, message = message });

    protected object _data;

    public object Getdata() => _data;

}

public class Result<T> : Result
{
    public int TotalCount { get; set; }

    public T data
    {
        get { return (T)_data; }
        set { _data = value; }
    }

    public static Result<T> Set(bool success, int code = 0, string message = "", T data = default(T), int totalCount = 0)
        => new Result<T> { success = success, code = code, message = message, data = data, TotalCount = totalCount };

    public static Task<Result<T>> SetAsync(bool success, int code = 0, string message = "", T data = default(T))
        => Task.FromResult(new Result<T> { success = success, code = code, message = message, data = data, TotalCount = 0 });

    public static Result<T> Failure(int code = -1, string message = "", T data = default(T))
        => new Result<T> { success = false, code = code, message = message, data = data, TotalCount = 0 };

    public static Result<T> Failure(int code = -1, List<string> errors = null, T data = default(T))
        => new Result<T> { success = false, code = code, Errors = errors, data = data, TotalCount = 0 };

    public static Task<Result<T>> FailureAsync(int code = -1, string message = "", T data = default(T))
        => Task.FromResult(new Result<T> { success = false, code = code, message = message, data = data, TotalCount = 0 });

    public static Task<Result<T>> FailureAsync(int code = -1, List<string> errors = null, T data = default(T))
        => Task.FromResult(new Result<T> { success = false, code = code, Errors = errors, data = data, TotalCount = 0 });

    public static Result<T> Successful(int code = 0, string message = "", T data = default(T))
        => new Result<T> { success = true, code = code, message = message, data = data, TotalCount = 0 };

    public static Task<Result<T>> SuccessfulAsync(int code = 0, string message = "", T data = default(T))
        => Task.FromResult(new Result<T> { success = true, code = code, message = message, data = data, TotalCount = 0 });
}
