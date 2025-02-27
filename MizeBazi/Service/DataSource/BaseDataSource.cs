namespace MizeBazi.DataSource
{
    public class BaseDataSource
    {
        public T1 Map<T1, T2>(T2 t2)
        {
            string jsonString = System.Text.Json.JsonSerializer.Serialize(t2);
            var m2 = System.Text.Json.JsonSerializer.Deserialize<T1>(jsonString);
            return m2;
        }
        public IEnumerable<T1> MapList<T1, T2>(IEnumerable<T2> t2)
        {
            string jsonString = System.Text.Json.JsonSerializer.Serialize(t2);
            var m2 = System.Text.Json.JsonSerializer.Deserialize<IEnumerable<T1>>(jsonString);
            return m2;
        }
    }
}
