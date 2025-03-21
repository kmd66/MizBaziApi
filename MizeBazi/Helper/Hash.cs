using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace MizeBazi.Helper;

public static class Hash
{
    public static string GetSecurityStamp(this int validHour)
    {
        return string.Format("{0}|{1}", Guid.NewGuid().ToString("N"), DateTime.Now.AddHours(validHour).Ticks);
    }

    public static string GetDigitsFromString(this string input, int from, int to)
        => new string(input.Where(char.IsDigit).ToArray()).Substring(from, to);
    public static string GetDigitsFromGuid()
        => Guid.NewGuid().ToString().GetDigitsFromString(0,5);

    public static string Md5(this string plainText)
    {
        return HashMd5.Hash(plainText);
    }


    public static string Base64Encrypt(this string plainText)
    {
        return Base64.Encrypt(plainText);
    }
    public static string Base64Encrypt(this byte[] bytes)
    {
        return Convert.ToBase64String(bytes);
    }

    public static string Base64Decrypt(this string plainText)
    {
        return Base64.Decrypt(plainText);
    }

    public static string HashText(this string plainText)
    {
        return HashSHA256.Hash("!<" + plainText + "]?");
    }

    public static string SHA256(this string plainText)
    {
        return HashSHA256.Hash(plainText);
    }


    public static string RsaEncrypt(this string plainText)
    {
        return Rsa.Encrypt(plainText);
    }

    public static string RsaDecrypt(this string plainText)
    {
        return Rsa.Decrypt(plainText);
    }
    public static string AesEncrypt(this string plainText, string k, string i)
    {
        return AesEncryption.Encrypt(plainText, Encoding.UTF8.GetBytes(k), Encoding.UTF8.GetBytes(i));
    }

    public static string AesDecrypt(this string plainText, string k, string i)
    {
        return AesEncryption.Decrypt(plainText, Encoding.UTF8.GetBytes(k), Encoding.UTF8.GetBytes(i));
    }

}

public class HashMd5
{
    public static string Hash(string plainText)
    {
        MD5 mD = MD5.Create();
        byte[] array = mD.ComputeHash(Encoding.Default.GetBytes(plainText));
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < array.Length; i++)
        {
            stringBuilder.Append(array[i].ToString("x2"));
        }

        return stringBuilder.ToString();
    }
}

public class HashSHA256
{
    public static string Hash(string input)
    {
        HashAlgorithm hashAlgorithm = new SHA256CryptoServiceProvider();
        byte[] bytes = Encoding.UTF8.GetBytes(input);
        byte[] inArray = hashAlgorithm.ComputeHash(bytes);
        return Convert.ToBase64String(inArray);
    }
}

public class Base64
{
    public static string Decrypt(string plainText)
    {
        byte[] bytes = Convert.FromBase64String(plainText);
        return Encoding.UTF8.GetString(bytes);
    }

    public static string Encrypt(string plainText)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(plainText);
        return Convert.ToBase64String(bytes);
    }

    public static string[] Decode(string s)
    {
        byte[] bytes = Convert.FromBase64String(s);
        string @string = Encoding.UTF8.GetString(bytes);
        Regex regex = new Regex("::");
        return regex.Split(@string);
    }
}

public enum DeploymentMode : byte
{
    Unknown,
    Development,
    Prodoction
}

public class RsaModel
{
    public string privateKey { get; set; }

    public string publicKey { get; set; }

    public string jsPublicKey { get; set; }
}

public class Rsa
{
    private static DeploymentMode _deploymentMode;

    private static int maxLength = 55;

    private static RsaModel _keyModel { get; set; }

    public static void Register(string deploymentMode, RsaModel keyModel)
    {
        _deploymentMode = ((!(deploymentMode == "2")) ? DeploymentMode.Development : DeploymentMode.Prodoction);
        _keyModel = keyModel;
    }

    public static string Encrypt(string input)
    {
        string text = "";
        if (string.IsNullOrEmpty(input))
        {
            return text;
        }

        double num = Math.Ceiling((double)input.Length / (double)maxLength);
        for (int i = 0; (double)i < num; i++)
        {
            int num2 = i * maxLength;
            string strText = ((num2 + maxLength > input.Length) ? input.Substring(num2, input.Length - num2) : input.Substring(num2, maxLength));
            string text2 = _Encryption(strText);
            text = text + text2 + " ";
        }

        return text;
    }

    public static string Decrypt(string input)
    {
        string text = "";
        if (string.IsNullOrEmpty(input))
        {
            return text;
        }

        string[] array = input.Split(' ');
        string[] array2 = array;
        foreach (string text2 in array2)
        {
            string text3 = text2.Trim();
            if (string.IsNullOrEmpty(text3))
            {
                break;
            }

            text += _Decryption(text3);
        }

        return text;
    }

    public static T Deserialize<T>(T input)
    {
        if (_deploymentMode == DeploymentMode.Development)
        {
            return input;
        }

        dynamic val = input;
        if (val == null || string.IsNullOrEmpty(val.Hash))
        {
            throw new Exception("Hash model is null");
        }

        dynamic val2 = Rsa.Decrypt(val.Hash);
        dynamic val3 = System.Text.Json.JsonSerializer.Deserialize<T>(val2);
        return val3;
    }

    public static RsaModel KeyGeneration()
    {
        RsaModel rsaModel = new RsaModel();
        using (RSACryptoServiceProvider rSACryptoServiceProvider = new RSACryptoServiceProvider(1024))
        {
            try
            {
                rsaModel.privateKey = rSACryptoServiceProvider.ToXmlString(includePrivateParameters: true);
                rsaModel.publicKey = rSACryptoServiceProvider.ToXmlString(includePrivateParameters: false);
                using (new RSACryptoServiceProvider(1024))
                {
                    try
                    {
                        rSACryptoServiceProvider.FromXmlString(rsaModel.publicKey);
                        rsaModel.jsPublicKey = _ExportPublicKey(rSACryptoServiceProvider);
                    }
                    finally
                    {
                        rSACryptoServiceProvider.PersistKeyInCsp = false;
                    }
                }
            }
            finally
            {
                rSACryptoServiceProvider.PersistKeyInCsp = false;
            }
        }

        return rsaModel;
    }

    private static string _Encryption(string strText)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(strText);
        using RSACryptoServiceProvider rSACryptoServiceProvider = new RSACryptoServiceProvider(1024);
        try
        {
            byte[] bytes2 = Encoding.UTF8.GetBytes("ب");
            byte[] bytes3 = Encoding.UTF8.GetBytes("d");
            int length = strText.Length;
            rSACryptoServiceProvider.FromXmlString(_keyModel.publicKey.ToString());
            byte[] inArray = rSACryptoServiceProvider.Encrypt(bytes, fOAEP: false);
            return Convert.ToBase64String(inArray);
        }
        finally
        {
            rSACryptoServiceProvider.PersistKeyInCsp = false;
        }
    }

    private static string _Decryption(string strText)
    {
        using RSACryptoServiceProvider rSACryptoServiceProvider = new RSACryptoServiceProvider(1024);
        try
        {
            rSACryptoServiceProvider.FromXmlString(_keyModel.privateKey);
            byte[] rgb = Convert.FromBase64String(strText);
            byte[] bytes = rSACryptoServiceProvider.Decrypt(rgb, fOAEP: false);
            string @string = Encoding.UTF8.GetString(bytes);
            return @string.ToString();
        }
        finally
        {
            rSACryptoServiceProvider.PersistKeyInCsp = false;
        }
    }

    private static string _ExportPublicKey(RSACryptoServiceProvider csp)
    {
        RSAParameters rSAParameters = csp.ExportParameters(includePrivateParameters: false);
        using MemoryStream memoryStream = new MemoryStream();
        BinaryWriter binaryWriter = new BinaryWriter(memoryStream);
        binaryWriter.Write((byte)48);
        using (MemoryStream memoryStream2 = new MemoryStream())
        {
            BinaryWriter stream = new BinaryWriter(memoryStream2);
            _EncodeIntegerBigEndian(stream, new byte[1]);
            _EncodeIntegerBigEndian(stream, rSAParameters.Modulus);
            _EncodeIntegerBigEndian(stream, rSAParameters.Exponent);
            _EncodeIntegerBigEndian(stream, rSAParameters.Exponent);
            _EncodeIntegerBigEndian(stream, rSAParameters.Exponent);
            _EncodeIntegerBigEndian(stream, rSAParameters.Exponent);
            _EncodeIntegerBigEndian(stream, rSAParameters.Exponent);
            _EncodeIntegerBigEndian(stream, rSAParameters.Exponent);
            _EncodeIntegerBigEndian(stream, rSAParameters.Exponent);
            int num = (int)memoryStream2.Length;
            _EncodeLength(binaryWriter, num);
            binaryWriter.Write(memoryStream2.GetBuffer(), 0, num);
        }

        char[] array = Convert.ToBase64String(memoryStream.GetBuffer(), 0, (int)memoryStream.Length).ToCharArray();
        StringBuilder stringBuilder = new StringBuilder();
        string text = "-----BEGIN PUBLIC KEY-----";
        stringBuilder.AppendLine("-----BEGIN PUBLIC KEY-----");
        for (int i = 0; i < array.Length; i += 64)
        {
            int num2 = Math.Min(64, array.Length - i);
            for (int j = 0; j < num2; j++)
            {
                stringBuilder.Append(array[i + j]);
                text += array[i + j];
            }

            stringBuilder.AppendLine();
        }

        text += "-----END PUBLIC KEY-----";
        stringBuilder.AppendLine("-----END PUBLIC KEY-----");
        return stringBuilder.ToString();
    }

    private static void _EncodeIntegerBigEndian(BinaryWriter stream, byte[] value, bool forceUnsigned = true)
    {
        stream.Write((byte)2);
        int num = 0;
        for (int i = 0; i < value.Length && value[i] == 0; i++)
        {
            num++;
        }

        if (value.Length - num == 0)
        {
            _EncodeLength(stream, 1);
            stream.Write((byte)0);
            return;
        }

        if (forceUnsigned && value[num] > 127)
        {
            _EncodeLength(stream, value.Length - num + 1);
            stream.Write((byte)0);
        }
        else
        {
            _EncodeLength(stream, value.Length - num);
        }

        for (int j = num; j < value.Length; j++)
        {
            stream.Write(value[j]);
        }
    }

    private static void _EncodeLength(BinaryWriter stream, int length)
    {
        if (length < 0)
        {
            throw new ArgumentOutOfRangeException("length", "Length must be non-negative");
        }

        if (length < 128)
        {
            stream.Write((byte)length);
            return;
        }

        int num = length;
        int num2 = 0;
        while (num > 0)
        {
            num >>= 8;
            num2++;
        }

        stream.Write((byte)((uint)num2 | 0x80u));
        for (int num3 = num2 - 1; num3 >= 0; num3--)
        {
            stream.Write((byte)((uint)(length >> 8 * num3) & 0xFFu));
        }
    }
}

public class AesEncryption
{
    public static string Encrypt(string plainText, byte[] k, byte[] i)
    {
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = k;
            aesAlg.IV = i;

            ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

            using (var msEncrypt = new System.IO.MemoryStream())
            {
                using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                {
                    using (var swEncrypt = new System.IO.StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(plainText);
                    }
                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }
    }

    public static string Decrypt(string cipherText, byte[] k, byte[] i)
    {
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = k;
            aesAlg.IV = i;

            ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

            using (var msDecrypt = new System.IO.MemoryStream(Convert.FromBase64String(cipherText)))
            {
                using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                {
                    using (var srDecrypt = new System.IO.StreamReader(csDecrypt))
                    {
                        return srDecrypt.ReadToEnd();
                    }
                }
            }
        }
    }

    /*
nodejs

const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from('12345678901234567890123456789012', 'utf8'); // 32 bytes (256 bits)
const iv = Buffer.from('1234567890123456', 'utf8'); // 16 bytes (128 bits)

function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

function decrypt(encryptedText) {
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// مثال استفاده
const original = "Hello, World!";
const encrypted = encrypt(original);
const decrypted = decrypt(encrypted);

console.log(`Original: ${original}`);
console.log(`Encrypted: ${encrypted}`);
console.log(`Decrypted: ${decrypted}`);

     */
}
