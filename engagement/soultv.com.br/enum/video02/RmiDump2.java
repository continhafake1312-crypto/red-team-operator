import java.rmi.registry.*;
import javax.management.remote.rmi.*;
import java.rmi.*;
public class RmiDump2 {
  public static void main(String[] a) throws Exception {
    String host="160.202.130.243"; int port=8085;
    Registry reg = LocateRegistry.getRegistry(host, port);
    System.out.println("Registry: " + reg);
    try {
      String[] names = reg.list();
      System.out.println("=== BOUND NAMES on 8085 ("+names.length+") ===");
      for (String n : names) System.out.println("  - " + n);
    } catch (Exception e) { System.out.println("list ERR: " + e); }
    for (String n : new String[]{"jmxrmi","jmx","JMXRMI","wowza","management","connector","platform","server"}) {
      try {
        Remote r = reg.lookup(n);
        System.out.println("  LOOKUP "+n+" -> "+r.getClass().getName());
        // print the stub details
        System.out.println("     toString: "+r);
        if (r instanceof RMIServer) {
          System.out.println("     IS RMIServer! Cast worked.");
          RMIServer sv = (RMIServer) r;
          System.out.println("     Version: "+sv.getVersion());
        }
      } catch (Exception ee) { System.out.println("  LOOKUP "+n+" ERR: "+ee.getMessage()); }
    }
  }
}
