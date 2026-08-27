import java.rmi.registry.*;
public class RmiDump {
  public static void main(String[] a) throws Exception {
    String host = "160.202.130.243"; int port = 8084;
    System.setProperty("java.rmi.server.hostname", host);
    Registry reg = LocateRegistry.getRegistry(host, port);
    System.out.println("Registry stub obtained: " + reg);
    try {
      String[] names = reg.list();
      System.out.println("=== BOUND NAMES (" + names.length + ") ===");
      for (String n : names) System.out.println("  - " + n);
    } catch (Exception e) {
      System.out.println("ERR listing: " + e);
    }
    String[] common = {"jmxrmi","jmx","JMXRMI","wowza","management","connector","platform","rmiServer","server"};
    for (String n : common) {
      try { var r = reg.lookup(n); System.out.println("  LOOKUP " + n + " -> " + r.getClass().getName()); }
      catch (Exception ee) { System.out.println("  LOOKUP " + n + " ERR: " + ee.getMessage()); }
    }
  }
}
